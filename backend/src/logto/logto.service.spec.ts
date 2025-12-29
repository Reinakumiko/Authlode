import { Test, TestingModule } from '@nestjs/testing';
import { LogtoService } from './logto.service';

describe('LogtoService', () => {
  let service: LogtoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogtoService],
    }).compile();

    service = module.get<LogtoService>(LogtoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
