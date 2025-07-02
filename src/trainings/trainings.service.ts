import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Equipment,
  TrainingFocus,
  TrainingStage,
  Exercise,
} from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';
import { ICreateTrainingInput } from './interfaces/trainings-interfaces';
import { TrainingPart } from './interfaces/training-part';
import e from 'express';

@Injectable()
export class TrainingsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async generate(createTrainingsInput: ICreateTrainingInput) {
    createTrainingsInput.calculationIndex =
      !createTrainingsInput.calculationIndex
        ? 0
        : createTrainingsInput.calculationIndex + 1;
    if ((createTrainingsInput.calculationIndex = 5)) {
      throw Error('imprssible to calculate training');
    }

    const { swimmerId, trainingTime, trainingFocus, availableTools } =
      createTrainingsInput;

    const trainingStages = await this.calculateStages(createTrainingsInput);

    const trainingDraft = await this.generateExersizes({
      trainingStages,
      swimmerId,
      trainingTime,
      trainingFocus,
      availableTools,
    });

    const finalTraining = (await this.validateTraining(trainingDraft))
      ? trainingDraft
      : this.generate(createTrainingsInput);

    await this.databaseService.training.create(finalTraining);

    return finalTraining;
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

    let stages: TrainingPart[] = [];

    if (!swimmer) {
      throw Error(`can't find swimmer with id: ${swimmerId}`);
    }

    if (swimmer.level < 5 || trainingFocus === TrainingFocus.BALANCE) {
      stages.push({
        numberInSequence: 0,
        partType: TrainingStage.WARM_UP,
        endTime: trainingTime * 0.3,
      });
      stages.push({
        numberInSequence: 1,
        partType: TrainingStage.TECHNIQUE,
        endTime: trainingTime,
      });
    } else {
      stages.push({
        numberInSequence: 0,
        partType: TrainingStage.WARM_UP,
        endTime: trainingTime * 0.2,
      });
      stages.push({
        numberInSequence: 1,
        partType: TrainingStage.TECHNIQUE,
        endTime: trainingTime * 0.6,
      });
      stages.push({
        numberInSequence: 2,
        partType: TrainingStage.SPEED_SERIES,
        endTime: trainingTime,
      });
    }

    return stages;
  }

  private async generateExersizes(input: {
    trainingStages: TrainingPart[];
    swimmerId: number;
    trainingTime: number;
    trainingFocus: TrainingFocus;
    availableTools: Equipment[];
  }) {
    const {
      trainingStages,
      swimmerId,
      trainingTime,
      trainingFocus,
      availableTools,
    } = input;
    const swimmer = await this.databaseService.swimmer.findUnique({
      where: {
        id: swimmerId,
      },
    });
    for (const trainingStage of trainingStages) {
      const possibleExercises = await this.databaseService.exercise.findMany({
        where: {
          appliedToStages: { has: trainingStage.partType },
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
        throw Error(
          `no exercises found for swimmer with id: ${swimmerId} for stage: ${trainingStage.partType}`,
        );
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
          TrainingExercises: {
            include: {
              exercise: true,
            },
          },
        },
      });

      const previosTrainingsExercises = latestTrainings.flatMap((training) =>
        training.TrainingExercises.map((te) => te.exercise),
      );

      const weightenedExercises: Array<{
        exercise: Exercise;
        weightCutOff: number;
      }> = [];
      let totalWeight: number = 0;

      for (const exercise of possibleExercises) {
        const weight = previosTrainingsExercises.includes(exercise) ? 0.3 : 1;
        totalWeight += weight;
        weightenedExercises.push({ exercise, weightCutOff: totalWeight });
      }

      const randomNumber = Math.random() * totalWeight;

      const selectedExercise = weightenedExercises.find(
        (we) => we.weightCutOff >= randomNumber,
      );
    }
  }

  private async validateTraining(training): Promise<boolean> {
    return true;
  }
}
