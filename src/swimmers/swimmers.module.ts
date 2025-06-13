import { Module } from '@nestjs/common';
import { SwimmersController } from './swimmers.controller';
import { SwimmersService } from './swimmers.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SwimmersController],
  providers: [SwimmersService],
})
export class SwimmersModule {}
