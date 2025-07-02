import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { Prisma } from 'generated/prisma';
import { ICreateTrainingInput } from './interfaces/trainings-interfaces';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  generate(@Body() createTrainingsInput: ICreateTrainingInput) {
    return this.trainingsService.generate(createTrainingsInput);
  }

  @Get()
  findAll() {
    return this.trainingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.trainingsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: Prisma.TrainingUpdateInput,
  ) {
    return this.trainingsService.update(+id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trainingsService.remove(+id);
  }
}
