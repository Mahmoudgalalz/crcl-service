import { Test, TestingModule } from '@nestjs/testing';
import { NewspaperService } from './newspaper.service';

describe('NewspaperService', () => {
  let service: NewspaperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewspaperService],
    }).compile();

    service = module.get<NewspaperService>(NewspaperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
