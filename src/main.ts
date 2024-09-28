import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createRootUser } from './common/init.data';
import { ErrorResponse } from './common/error.response';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('CRCL APIs')
    .setDescription('This is the API version for the Mobile')
    .setVersion('1.0')
    .addTag('mobile')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  Logger.log(`Allowed Origins ${process.env.origins}`);

  const corsOption = {
    origin: process.env.origins,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  await createRootUser('root', process.env.ADMIN, process.env.PASSWORD);

  app.use(cookieParser());
  app.enableCors(corsOption);
  app.useGlobalFilters(new ErrorResponse());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000, () => Logger.log(`CRCL backend is up on: 3000.`));
}
bootstrap();
