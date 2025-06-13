import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExercisesModule } from './exercises/exercises.module';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { SwimmersModule } from './swimmers/swimmers.module';
import { SwimmersController } from './swimmers/swimmers.controller';
import { SwimmersService } from './swimmers/swimmers.service';
import { TrainingsModule } from './trainings/trainings.module';
import { TrainingsController } from './trainings/trainings.controller';
import { TrainingsService } from './trainings/trainings.service';

@Module({
  imports: [ExercisesModule, TrainingsModule, SwimmersModule, DatabaseModule],
  controllers: [AppController, TrainingsController, SwimmersController],
  providers: [AppService, TrainingsService, SwimmersService, DatabaseService],
})
export class AppModule {}
