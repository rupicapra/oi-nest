import { Module, Global } from '@nestjs/common';
import { OiController } from './oi.controller';
import { OiService } from './oi.service';

@Global()
@Module({
  controllers: [OiController], // OiController should be listed here
  providers: [OiService], // OiService should be listed here
  exports: [OiService], // Export only if needed outside this module
})
export class OiModule {}
