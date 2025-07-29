import { Injectable } from '@nestjs/common';
import { Prisma, Equipment, TrainingFocus, TrainingStage, Exercise, Training, Status } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';
import { ICreateTrainingInput } from './interfaces/trainings-interfaces';
import { TrainingPart } from './interfaces/training-part';
import e from 'express';
import { calculateStagesForSwimmer } from './ generate-training-helpers.ts/calculate-stages-helper';
import { generateExercises } from './ generate-training-helpers.ts/generate-exercises-helper';

@Injectable()
export class TrainingsService {
    constructor(private readonly databaseService: DatabaseService) {}
    async generate(createTrainingInput: ICreateTrainingInput) {
        createTrainingInput.calculationIndex = !createTrainingInput.calculationIndex ? 0 : createTrainingInput.calculationIndex + 1;
        if (createTrainingInput.calculationIndex === 5) {
            throw Error('imprssible to calculate training');
        }

        const { swimmerId, trainingTime, trainingFocus, availableTools } = createTrainingInput;

        const trainingStages = await this.calculateStages(createTrainingInput);

        const trainingExercises = await this.generateExersizes({
            trainingStages,
            swimmerId,
            trainingTime,
            trainingFocus,
            availableTools,
        });

        const validatedTraining = await this.validateTrainingAndPrepare({ trainingExercises, createTrainingInput });

        const finalTraining = validatedTraining ? validatedTraining : this.generate(createTrainingInput);

        await this.create(finalTraining);

        return finalTraining;
    }

    async create(createTrainingInput: Prisma.TrainingCreateInput) {
        return this.databaseService.training.create({
            data: createTrainingInput,
        });
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

    /**
     * Function calculated stages of the training.
     * By default we hardcode 3 stages for levels of swimmers above 5 and 2 for below,
     * the main outcome is cut-offs of all the stages, when they should end
     */
    private async calculateStages(createTrainingsInput: ICreateTrainingInput) {
        const { swimmerId, trainingTime, trainingFocus } = createTrainingsInput;

        const swimmer = await this.databaseService.swimmer.findUnique({
            where: {
                id: swimmerId,
            },
        });

        if (!swimmer) {
            throw Error(`can't find swimmer with id: ${swimmerId}`);
        }

        return calculateStagesForSwimmer({ swimmer, trainingTime, trainingFocus });
    }

    private async generateExersizes(input: {
        trainingStages: TrainingPart[];
        swimmerId: number;
        trainingTime: number;
        trainingFocus: TrainingFocus;
        availableTools: Equipment[];
    }): Promise<Prisma.TrainingExerciseCreateManyTrainingInput[]> {
        const { trainingStages, swimmerId, availableTools } = input;
        const trainingFocus = TrainingFocus[input.trainingFocus as keyof typeof TrainingFocus];
        const swimmer = await this.databaseService.swimmer.findUnique({
            where: {
                id: swimmerId,
            },
        });

        if (!swimmer) {
            throw Error(`can't find swimmer with id: ${swimmerId}`);
        }

        const possibleExercises = await this.databaseService.exercise.findMany({
            where: {
                minRecommendedLevel: {
                    gte: 0,
                    lte: swimmer?.level,
                },
                maxRecommendedLevel: {
                    gte: swimmer?.level,
                    lte: 10,
                },
                equipment: {
                    hasEvery: availableTools,
                },
                trainingFocuses: {
                    has: trainingFocus,
                },
            },
        });

        if (possibleExercises.length === 0) {
            throw Error(`no exercises found for swimmer with id: ${swimmerId}`);
        }

        const latestTrainings = await this.databaseService.training.findMany({
            where: {
                status: 'DONE',
            },
            orderBy: {
                doneAt: 'desc',
            },
            take: 2,
            include: {
                trainingExercises: {
                    include: {
                        exercise: true,
                    },
                },
            },
        });

        const previosTrainingsExerciseIds: number[] = latestTrainings ? latestTrainings.flatMap((training) => training.trainingExercises.map((te) => te.exercise.id)) : [];

        return generateExercises({
            possibleExercises,
            trainingStages,
            previosTrainingsExerciseIds,
            swimmerPace: swimmer.pace100,
        });
    }

    private async validateTrainingAndPrepare(input: {
        trainingExercises: Prisma.TrainingExerciseCreateManyTrainingInput[];
        createTrainingInput: ICreateTrainingInput;
    }): Promise<Prisma.TrainingCreateInput> {
        const { trainingExercises, createTrainingInput } = input;
        const { trainingTime, availableTools } = createTrainingInput;

        // Add here time validation for the future

        const finalTraining: Prisma.TrainingCreateInput = {
            swimmer: {
                connect: {
                    id: createTrainingInput.swimmerId,
                },
            },
            trainingExercises: {
                createMany: {
                    data: trainingExercises,
                },
            },
            status: Status.CREATED,
        };
        return finalTraining;
    }
}
