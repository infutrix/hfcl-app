import { Test, TestingModule } from '@nestjs/testing';
import { OtdrController } from './otdr.controller';
import { OtdrService } from './otdr.service';

describe('OtdrController', () => {
  let controller: OtdrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtdrController],
      providers: [OtdrService],
    }).compile();

    controller = module.get<OtdrController>(OtdrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
