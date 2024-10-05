import { Test, TestingModule } from '@nestjs/testing';
import { NewspaperController } from './newspaper.controller';

describe('NewspaperController', () => {
  let controller: NewspaperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewspaperController],
    }).compile();

    controller = module.get<NewspaperController>(NewspaperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
