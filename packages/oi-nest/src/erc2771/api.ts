import {  EthereumContractAPI } from '@openibex/ethereum'
import { Contract, Wallet, FunctionFragment, AbiCoder } from 'ethers';

/**
 * API of the ERC20 contract
 */
export class Erc2771Api extends EthereumContractAPI {

  // FIXME this is widely duplicate with EthereumContractAPI prepareCall 
  // So de-duplicate this, especially since prepareCall is in the base class !!!!


  public async removeMePrepCall(actualContract: Contract, functionName: string, argsArray: string[]): Promise<{ args: any[], fragment: FunctionFragment }> {
    const fragments = actualContract.interface.fragments;
  
    // Find the corresponding FunctionFragment
    let myFragment: FunctionFragment | undefined = undefined;
    for (const f of fragments) {
      if (!FunctionFragment.isFunction(f)) {
        continue;
      }
      if ((f as FunctionFragment).name === functionName) {
        myFragment = f as FunctionFragment;
      }
    }
  
    if (myFragment === undefined) {
      throw new Error(`Cannot find ABI-definition of function ${functionName}`);
    }
  
    // Convert the arguments to the correct types using ABI coder
    const abiCoder = new AbiCoder();
    const convertedArgs = argsArray.map((arg, index) => {
      const inputType = myFragment!.inputs[index].type;
  
      // Ignore arguments wrapped in '...'
      if (arg.startsWith("'") && arg.endsWith("'")) {
        return arg.slice(1, -1); // Strip the quotes and use as-is
      }
  
      // Parse JSON objects
      try {
        if (arg.startsWith('{') && arg.endsWith('}')) {
          return JSON.parse(arg); // JSONs are usually structs - keep them.
        }
      } catch {
        // If JSON parsing fails, fall back to treating as a string/number        
      }
  
      // Treat as a string or number
      return abiCoder.decode([inputType], abiCoder.encode([inputType], [arg]))[0];
    });
  
    return { args: convertedArgs, fragment: myFragment };
  }


  async forwardRequest(invokedContract: Contract, signer: Wallet, functionName: string, functionData: any[], eip712: {name: string, version: string}): Promise<Object> {

    const functionFragment = invokedContract.interface.getFunction(functionName);
    const isView = functionFragment.stateMutability === "view" || functionFragment.stateMutability === "pure";

    // E.g. for OmeiTradingContract
    // We could use functionName = "setDefaultTotalOfferedEnergyLimit", functionData = [123456n]

    const preparedCallData = await this.removeMePrepCall(invokedContract, functionName, functionData);
    const encodedFunctionCall = invokedContract.interface.encodeFunctionData(functionName, preparedCallData.args);

    // Pre-Flight check OR view execution...!
    try {
      const response = await invokedContract[functionName].staticCall(...preparedCallData.args, { from: signer.address });
      if(isView) {
        // TODO this only supports functions which return one value
        return this.decodeResultFromAbi(response, functionFragment);
      }
    } catch (error: any) {
      if(error.reason) {
        throw new Error(`Transaction reverted with reason: ${error.reason}`)
      }
      else {
        throw new Error(`Simulation failed: ${error.message}`);
      }
    }

    // Construct the meta-transaction request
    const nonce = await (await this.getRawContract())['nonces'](signer.address);


    // Simulation was successful, now actually execute

    const request = {
        from: signer.address,
        to: await invokedContract.getAddress(),
        value: 0,
        nonce: nonce, // Include the nonce here
        gas: 100_000_000, // Adjust gas limit as needed
        data: encodedFunctionCall,
        deadline: 1860058393 // FIXME
    };


    // Sign the request using EIP-712
    const _domain = {
        name: eip712.name, // Needs to match the ERC-2771 name in CustodialContract-constructor
        version: eip712.version,
        chainId: this.assetArtifact.chainId.reference,
        verifyingContract: this.assetArtifact.assetName.reference
    };

    const types = {
        ForwardRequest: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "gas", type: "uint256" },
            { name: "nonce", type: "uint256" }, // Add nonce
            { name: "deadline", type: "uint48" },
            { name: "data", type: "bytes" }
        ]
    };

    const signature = await signer.signTypedData(_domain, types, request);

    const toSend = {
      from: request.from,
      to: request.to,
      value: request.value,
      gas: request.gas,
      deadline: request.deadline,
      data: request.data,
      signature: signature,
    };
  
    const tx = await (await this.getRawContract()).execute(toSend);
    const receipt = await tx.wait();
    return receipt;
  }    
}
