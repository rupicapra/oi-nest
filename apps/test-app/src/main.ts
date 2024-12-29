import 'reflect-metadata'; // This must be first!

import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { LoggerFactory } from './LoggerFactory';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory('MyApp'),
  });

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true, 
      whitelist: true, 
      forbidNonWhitelisted: true,
    }
  ));


  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI available at /api*/

  
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true, // Drop all non-specified fields
    }),
  );
  
  await app.listen(3000);
}
bootstrap();
