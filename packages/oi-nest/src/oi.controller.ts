import { Controller, forwardRef, Get, Inject } from '@nestjs/common';
import { OiService } from './oi.service';

@Controller('oi') // The base route for this module will be `/oi`
export class OiController {
  constructor( @Inject(forwardRef(() => OiService)) private readonly oiService: OiService) {
  }

  @Get('hello') // The full route will be `/oi/hello`
  getHello(): string {
    return this.oiService.getHello();
  }
}
