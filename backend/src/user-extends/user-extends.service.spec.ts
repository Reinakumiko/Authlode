import { Test, TestingModule } from '@nestjs/testing';
import { UserExtendsService } from './user-extends.service';

describe('UserExtendsService', () => {
  let service: UserExtendsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserExtendsService],
    }).compile();

    service = module.get<UserExtendsService>(UserExtendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
