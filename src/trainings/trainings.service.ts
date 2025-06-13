import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TrainingsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createTrainingsInput) {
    return {};
  }

  async findAll() {
    return this.databaseService.training.findMany();
  }

  async findOne(id: number) {
    return this.databaseService.training.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateTrainingDto: Prisma.TrainingUpdateInput) {
    return this.databaseService.training.update({
      where: {
        id,
      },
      data: updateTrainingDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.training.delete({
      where: {
        id,
      },
    });
  }
}
