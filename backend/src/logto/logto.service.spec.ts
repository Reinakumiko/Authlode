import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { LogtoService } from './logto.service';

describe('LogtoService', () => {
  let service: LogtoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogtoService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              ({
                LOGTO_MANAGEMENT_API_ENDPOINT: 'http://localhost:3003/api',
                LOGTO_MANAGEMENT_API_KEY: 'test-key',
              })[key],
          },
        },
        { provide: HttpService, useValue: {} },
      ],
    }).compile();

    service = module.get<LogtoService>(LogtoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
