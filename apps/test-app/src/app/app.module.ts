import { Module, Global } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OiModule } from '@rupicapra/oi-nest';

@Global()
@Module({
  imports: [OiModule], // Ensure this is imported
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
