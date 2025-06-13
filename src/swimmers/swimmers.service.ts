import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class SwimmersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSwimmerDto: Prisma.SwimmerCreateInput) {
    return this.databaseService.swimmer.create({
      data: createSwimmerDto,
    });
  }

  async findAll() {
    return this.databaseService.swimmer.findMany();
  }

  async findOne(id: number) {
    return this.databaseService.swimmer.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateSwimmerDto: Prisma.SwimmerUpdateInput) {
    return this.databaseService.swimmer.update({
      where: {
        id,
      },
      data: updateSwimmerDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.swimmer.delete({
      where: {
        id,
      },
    });
  }
}
