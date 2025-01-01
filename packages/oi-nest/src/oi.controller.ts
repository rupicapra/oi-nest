import { Body, Controller, forwardRef, Get, Inject, Post, } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { OiService } from './oi.service';
import { ExecuteSmartContractDto } from './dto/execute-function.dto';
import { REQUEST } from '@nestjs/core';
import { GenerateKeystoreDto } from './dto/generate-keystore.dto';

@Controller('oi')
export class OiController {
  constructor(@Inject(forwardRef(() => OiService)) private readonly oiService: OiService,
    @Inject(REQUEST) private readonly request: Request
  ) {}
  
  @Post('execute')
  @ApiBody({
    type: () => ExecuteSmartContractDto   
  })
  async executeSmartContract( 
  ) {
    const data = this.request.body as unknown as ExecuteSmartContractDto;
    return await this.oiService.execute(data);  
  }

  @Post('generateKeystore')
  @ApiBody({
    type: () => GenerateKeystoreDto   
  })
  async generateKeystore( 
  ) {

    const data = this.request.body as unknown as GenerateKeystoreDto;
    return await this.oiService.generateKeystore(data);  
  }
}
