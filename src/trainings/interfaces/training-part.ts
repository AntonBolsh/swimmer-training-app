import { TrainingStage } from 'generated/prisma';

export class TrainingPart {
    numberInSequence: number;
    endTime: number;
    partType: TrainingStage;
    exercises?: { exerciseId: number; length: number; trainingStage: TrainingStage }[];
}
