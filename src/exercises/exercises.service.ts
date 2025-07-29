import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ExercisesService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(createExerciseDto: Prisma.ExerciseCreateInput) {
        return this.databaseService.exercise.create({
            data: createExerciseDto,
        });
    }

    async findAll() {
        return this.databaseService.exercise.findMany();
    }

    async findOne(id: number) {
        return this.databaseService.exercise.findUnique({
            where: {
                id,
            },
        });
    }

    async update(id: number, updateExerciseDto: Prisma.ExerciseUpdateInput) {
        return this.databaseService.exercise.update({
            where: {
                id,
            },
            data: updateExerciseDto,
        });
    }

    async remove(id: number) {
        return this.databaseService.exercise.delete({
            where: {
                id,
            },
        });
    }
}
