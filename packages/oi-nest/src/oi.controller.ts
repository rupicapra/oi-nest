import { Body, Controller, forwardRef, Get, Inject, Post, } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { OiService } from './oi.service';
import { ExecuteSmartContractDto } from './dto/execute-function.dto';
import { REQUEST } from '@nestjs/core';
import { GenerateKeystoreDto } from './dto/generate-keystore.dto';
import { ExecuteMetaDto } from './dto/execute-meta.dto';
import { VerifyKeystoreDto } from './dto/verify-keystore.dto';

@Controller('oi')
export class OiController {
  constructor(@Inject(forwardRef(() => OiService)) private readonly oiService: OiService,
    @Inject(REQUEST) private readonly request: Request
  ) {}
  
  @Post('execute')
  @ApiOperation({
    summary: "Executes / calls a SmartContract-function ",
    description: "Executes a function or calls a view with name `function_name` in `artifact` and passes `args`. The provider is connect to `wallet`, which is the transaction signer."
  })
  @ApiBody({
    type: () => ExecuteSmartContractDto   
  })
  async executeSmartContract( 
  ) {
    const data = this.request.body as unknown as ExecuteSmartContractDto;
    return await this.oiService.execute(data);  
  }

  @Post('meta/execute')
  @ApiOperation({
    summary: "Executes a SmartContract-function via ERC-2771-Forwarder",
    description: "Executes a function via ERC-2771 forwarder. Note that no views or pure methods are allowed. For general functionality, refer the normal `execute` endpoint The function is executed on behalf of the wallet in `meta.keystore`, which is decrypted using `meta.password`. The `options.wallet` is the gas-payer signing the transaction towards `forwarder`-ERC-2771-contract."
  })
  @ApiBody({
    type: () => ExecuteMetaDto
  })
  async executeSmartContractMeta( 
  ) {
    const data = this.request.body as unknown as ExecuteMetaDto;
    return await this.oiService.executeMeta(data);  
  }

  @Post('dev/generateKeystore')
  @ApiOperation({
    summary: 'Generates a JSON-KeyStore file. !!! NEVER CALL IN PRODUCTION !!!',
    description: "This generates [JSON-Keystore File](https://docs.ethers.org/v6/api/wallet/#json-wallets) and accepts the private key of the wallet as well as the password to decrypt the KeyStore-File. This is highly sensitive information, therefore it is strongly advised to only use this endpoint in a closed environment / your environment! As you know, never share you private key!"
  })
  @ApiBody({
    type: () => GenerateKeystoreDto   
  })
  async generateKeystore( 
  ) {

    const data = this.request.body as unknown as GenerateKeystoreDto;
    return await this.oiService.generateKeystore(data);  
  }

  @Post('dev/verifyKeystore')
  @ApiBody({
    type: () => VerifyKeystoreDto   
  })
  @ApiOperation({
    summary: 'Verifies a JSON-KeyStore file. !!! NEVER CALL IN PRODUCTION !!!',
    description: "This verifies a [JSON-Keystore File](https://docs.ethers.org/v6/api/wallet/#json-wallets) which was e.g. generated via `generateKeystore`. Providing the decryption password is highly sensitive information, therefore it is strongly advised to only use this endpoint in a closed environment / your environment! This could compromise your wallet!"
  })
  async verifyKeystore( 
  ) {

    const data = this.request.body as unknown as VerifyKeystoreDto;    
    return await this.oiService.verifyKeystore(data);  
  }
}
