import { Swimmer, TrainingFocus, TrainingStage } from 'generated/prisma';
import { TrainingPart } from '../interfaces/training-part';

export function calculateStagesForSwimmer(input: {
  swimmer: Swimmer;
  trainingTime: number;
  trainingFocus: TrainingFocus;
}): TrainingPart[] {
  let stages: TrainingPart[] = [];

  const { swimmer, trainingTime, trainingFocus } = input;

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
