import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createRootUser } from './common/init.data';

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
  await createRootUser('root', process.env.ADMIN, process.env.PASSWORD);
  await app.listen(3000);
}
bootstrap();
