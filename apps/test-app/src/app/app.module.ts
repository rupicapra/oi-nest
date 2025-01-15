import { Module, Global, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OiModule, OiService } from '@rupicapra/oi-nest';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';

@Global()
@Module({
  imports: [
    OiModule,
    ],
  controllers: [AppController],
  providers: [AppService, OiService],
})
export class AppModule {}
