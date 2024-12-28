import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get('hello-world')
  helloWorld(): string {
    return 'Hello, World!';
  }

  @Get('fail')
  fail(): string {
    const blubi = undefined;
    return blubi.hello();
  }
}
