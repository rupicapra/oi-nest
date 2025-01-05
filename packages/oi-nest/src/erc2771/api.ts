import {  EthereumContractAPI } from '@openibex/ethereum'
import { Contract, Wallet } from 'ethers';

/**
 * API of the ERC20 contract
 */
export class Erc2771Api extends EthereumContractAPI {
  async forwardRequest(invokedContract: Contract, signer: Wallet, functionName: string, functionData, eip712: {name: string, version: string}): Promise<Object> {

    const functionFragment = invokedContract.interface.getFunction(functionName);
    const isView = functionFragment.stateMutability === "view" || functionFragment.stateMutability === "pure";

    if (isView) {
        throw Error("Views cannot be executed, invoke the contract directly via invokedContract.connect(theSigner).functionName(functionData)");
    }

    // Construct the meta-transaction request
    const nonce = await (await this.getRawContract())['nonces'](signer.address);

    // E.g. for OmeiTradingContract
    // We could use functionName = "setDefaultTotalOfferedEnergyLimit", functionData = [123456n]
    const encodedFunctionCall = invokedContract.interface.encodeFunctionData(functionName, functionData);

    // Pre-Flight check!
    try {
      await invokedContract[functionName].staticCall(...functionData, { from: signer.address });
    } catch (error: any) {
      if(error.reason) {
        throw new Error(`Transaction reverted with reason: ${error.reason}`)
      }
      else {
        throw new Error(`Simulation failed: ${error.message}`);
      }
    }

    const request = {
        from: signer.address,
        to: await invokedContract.getAddress(),
        value: 0,
        nonce: nonce, // Include the nonce here
        gas: 100_000_000, // Adjust gas limit as needed
        data: encodedFunctionCall,
        deadline: 1860058393 // FIXME
    };

    // Simulate the transaction using callStatic
    try {
      await (await this.getRawContract()).callStatic.execute({
        from: request.from,
        to: request.to,
        value: request.value,
        gas: request.gas,
        deadline: request.deadline,
        data: request.data,
        signature: '0x', // Provide a dummy signature for simulation
      });
    } catch (error: any) {
      if (error.info?.errorArgs?.length > 0) {
        const revertReason = error.info.errorArgs[0];
        throw new Error(`Transaction reverted with reason: ${revertReason}`);
      } else {
        throw new Error(`Simulation failed: ${error.message}`);
      }
    }


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
