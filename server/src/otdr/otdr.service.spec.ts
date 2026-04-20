import { Test, TestingModule } from '@nestjs/testing';
import { OtdrService } from './otdr.service';

describe('OtdrService', () => {
  let service: OtdrService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtdrService],
    }).compile();

    service = module.get<OtdrService>(OtdrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
