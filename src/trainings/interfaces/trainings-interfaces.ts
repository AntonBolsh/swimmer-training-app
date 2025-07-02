import { Equipment, TrainingFocus } from 'generated/prisma';

export interface ICreateTrainingInput {
  swimmerId: number;
  trainingTime: number; //in seconds
  availableTools: Equipment[];
  trainingFocus: TrainingFocus;
  calculationIndex?: number;
}
