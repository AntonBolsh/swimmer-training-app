import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ExercisesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createExcerciseDto: Prisma.ExcerciseCreateInput) {
    return this.databaseService.excercise.create({
      data: createExcerciseDto,
    });
  }

  async findAll() {
    return this.databaseService.excercise.findMany();
  }

  async findOne(id: number) {
    return this.databaseService.excercise.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateExcerciseDto: Prisma.ExcerciseUpdateInput) {
    return this.databaseService.excercise.update({
      where: {
        id,
      },
      data: updateExcerciseDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.excercise.delete({
      where: {
        id,
      },
    });
  }
}
