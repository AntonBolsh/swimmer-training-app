import { Test, TestingModule } from '@nestjs/testing';
import { SwimmersController } from './swimmers.controller';

describe('SwimmersController', () => {
  let controller: SwimmersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SwimmersController],
    }).compile();

    controller = module.get<SwimmersController>(SwimmersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
