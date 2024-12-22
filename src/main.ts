import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  createRootUser,
  createTempUser,
  creatRootTokenPrice,
} from './common/init.data';
import { ErrorResponse } from './common/error.response';
import { Logger, ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { SpelunkerModule } from 'nestjs-spelunker';
import * as fs from 'fs';

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

  const origins = process.env.origins
    ? process.env.origins.replace(' ', '').split(',')
    : [];
  Logger.log(origins);
  const corsOption = {
    origin: origins,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    // credentials: true,
  };

  await createRootUser('root', process.env.ADMIN, process.env.PASSWORD);
  await createTempUser('temp-ex', 'krotemp@kro.com', process.env.PASSWORD);
  await creatRootTokenPrice(Number(process.env.TOKEN_PRICE));

  app.use(cookieParser());
  app.enableCors(corsOption);
  app.useGlobalFilters(new ErrorResponse());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  // if (process.env.NODE_ENV === 'development') {
  //   void generateDependencyGraph(app);
  // }

  await app.listen(2002, () => Logger.log(`CRCL backend is up on: 2002.`));
}
bootstrap();

async function generateDependencyGraph(app: INestApplication) {
  // Module dependencies graph
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  const mermaidEdges = edges
    .map(({ from, to }) => `  ${from.module.name}-->${to.module.name}`)
    // filter out modules from the chart if you need
    .filter(
      (edge) =>
        !edge.includes('FilteredModule') && !edge.includes('OtherExample'),
    )
    .sort();
  // write into file
  fs.writeFileSync(
    'deps.mermaid',
    `graph LR
${mermaidEdges.join('\n')}`,
  );
}
