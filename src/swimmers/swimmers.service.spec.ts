import { Test, TestingModule } from '@nestjs/testing';
import { SwimmersService } from './swimmers.service';

describe('SwimmersService', () => {
  let service: SwimmersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwimmersService],
    }).compile();

    service = module.get<SwimmersService>(SwimmersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
