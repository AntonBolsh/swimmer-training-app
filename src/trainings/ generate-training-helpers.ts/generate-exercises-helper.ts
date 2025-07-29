import { Exercise, Prisma } from 'generated/prisma';
import { TrainingPart } from '../interfaces/training-part';

export function generateExercises(input: {
    possibleExercises: Exercise[];
    trainingStages: TrainingPart[];
    previosTrainingsExerciseIds?: number[];
    swimmerPace: number;
}): Prisma.TrainingExerciseCreateManyTrainingInput[] {
    const { trainingStages, possibleExercises, previosTrainingsExerciseIds, swimmerPace } = input;

    let trainingTime = 0;

    let trainingExercises: Prisma.TrainingExerciseCreateManyTrainingInput[] = [];

    for (const trainingStage of trainingStages) {
        const possibleExercisesForStage = possibleExercises.filter((exercise) => exercise.appliedToStages.includes(trainingStage.partType));

        const generatedStage = generateExercisesForStage({
            trainingStage,
            possibleExercisesForStage,
            previosTrainingsExerciseIds,
            swimmerPace,
            trainingTime,
        });

        trainingTime = generatedStage.trainingTime;

        if (generatedStage.trainingPart.exercises) {
            trainingExercises.push(...generatedStage.trainingPart.exercises);
        }
    }

    return trainingExercises;
}

function generateExercisesForStage(input: { trainingStage: TrainingPart; possibleExercisesForStage: Exercise[]; previosTrainingsExerciseIds?: number[]; swimmerPace: number; trainingTime: number }): {
    trainingPart: TrainingPart;
    trainingTime: number;
} {
    const { trainingStage, possibleExercisesForStage, previosTrainingsExerciseIds, trainingTime, swimmerPace } = input;

    let currentTime = trainingTime;

    const trainingPart = trainingStage;
    trainingPart.exercises = [];

    const weightenedExercises: Array<{
        exercise: Exercise;
        weightCutOff: number;
    }> = [];
    let totalWeight: number = 0;

    for (const exercise of possibleExercisesForStage) {
        const weight = previosTrainingsExerciseIds?.includes(exercise.id) ? 0.3 : 1;
        totalWeight += weight;
        weightenedExercises.push({ exercise, weightCutOff: totalWeight });
    }

    const randomNumber = Math.random() * totalWeight;

    const selectedExercise = weightenedExercises.find((we) => we.weightCutOff >= randomNumber);

    if (!selectedExercise) {
        throw new Error('No exercise selected, random is broken');
    }

    let lengthOfExercise: number;

    const leftMeters = (100 * (trainingPart.endTime - trainingTime)) / (swimmerPace * selectedExercise.exercise.paceMultiplier);

    if (leftMeters < 50) {
        lengthOfExercise = 0;
    } else if (leftMeters < 200) {
        lengthOfExercise = Math.round(leftMeters / 100) * 100;
        trainingPart.exercises.push({
            exerciseId: selectedExercise.exercise.id,
            length: lengthOfExercise,
            trainingStage: trainingPart.partType,
        });
        currentTime += lengthOfExercise / (swimmerPace * selectedExercise.exercise.paceMultiplier);
        return { trainingPart, trainingTime: currentTime };
    }

    lengthOfExercise = [100, 200, 300, 400, 500][Math.floor(Math.random() * 4)];
    trainingPart.exercises.push({
        exerciseId: selectedExercise.exercise.id,
        length: lengthOfExercise,
        trainingStage: trainingPart.partType,
    });

    currentTime += lengthOfExercise / (swimmerPace * selectedExercise.exercise.paceMultiplier);

    return generateExercisesForStage({ trainingStage: trainingPart, possibleExercisesForStage, previosTrainingsExerciseIds, swimmerPace, trainingTime: currentTime });
}
