import { Body, Controller, forwardRef, Get, Inject, Post, } from '@nestjs/common';
import { ApiBody, ApiExcludeEndpoint, ApiOperation } from '@nestjs/swagger';
import { OiService } from './oi.service';
import { ExecuteSmartContractDto } from './dto/execute-function.dto';
import { REQUEST } from '@nestjs/core';

@Controller('oi')
export class OiController {
  constructor(@Inject(forwardRef(() => OiService)) private readonly oiService: OiService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  @Get('hello')
  getHello(): string {
    return this.oiService.getHello();
  }

  @Post('execute')
  @ApiBody({
    type: () => ExecuteSmartContractDto   
  })
  async executeSmartContract( 
  ) {

    console.log(this.request.body);
    const data = this.request.body as unknown as ExecuteSmartContractDto;
    console.log(data);
    return await this.oiService.execute(data);
  
  }
}
