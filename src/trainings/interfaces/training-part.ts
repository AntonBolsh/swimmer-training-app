import { TrainingExercise, TrainingStage } from 'generated/prisma';

export class TrainingPart {
  numberInSequence: number;
  endTime: number;
  partType: TrainingStage;
  excersizes?: TrainingExercise[];
}
