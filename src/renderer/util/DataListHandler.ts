import { Result } from 'regression';
import {
  AcousticParameterTableData,
  EvaluationBySingleParticipant,
  EvaluationDetail,
  FormattedExperimentData,
  FormattedNoiseSensitivityScaleData,
  SamplesEvaluationByParticipant,
} from '../model/ExperimentDataModel';
import getLinearRegressionResult from './Algorithm';

/**
 * Separates items in the provided dataList into two categories based on the scale of the experiment.
 * @param dataList An array containing items of types AcousticParameterTableData, FormattedNoiseSensitivityScaleData, or FormattedExperimentData.
 * @returns An object containing two properties:
 *  - acousticParameterTableData: The item with scale 'acoustic parameter' if found, otherwise undefined.
 *  - experimentData: The item with scale 'digital' or 'word' if found, otherwise undefined.
 */
export default function separateList(
  dataList: Array<
    | AcousticParameterTableData
    | FormattedNoiseSensitivityScaleData
    | FormattedExperimentData
  >,
): {
  acousticParameterTableData: AcousticParameterTableData | undefined;
  experimentData: FormattedExperimentData | undefined;
} {
  let acousticParameterTableData: AcousticParameterTableData | undefined;
  let experimentData: FormattedExperimentData | undefined;

  dataList.forEach((item) => {
    console.log(dataList);

    if (item.experiment.scale === 'acoustic parameter') {
      acousticParameterTableData = <AcousticParameterTableData>item;
    } else if (
      item.experiment.scale === 'digital' ||
      item.experiment.scale === 'word'
    ) {
      experimentData = <FormattedExperimentData>item;
    }
  });

  return {
    acousticParameterTableData,
    experimentData,
  };
}

/**
 * Calculates the average rating for each sample in the experiment data by averaging the ratings given by participants.
 * @param originalData The original experiment data containing participant evaluations.
 * @returns The updated experiment data with the average ratings for each sample.
 */
function getExperimentDataAfterAveragingTheRatingOfSamples(
  originalData: FormattedExperimentData,
): FormattedExperimentData {
  const updatedEvaluations: SamplesEvaluationByParticipant[] = [];
  // 遍历每个受试者的评价
  // eslint-disable-next-line no-restricted-syntax
  for (const participantEvaluation of originalData.evaluations) {
    const updatedParticipantEvaluations: EvaluationBySingleParticipant[] = [];

    // 遍历当前受试者的每个声样本评价
    // eslint-disable-next-line no-restricted-syntax
    for (const singleEvaluation of participantEvaluation.currentParticipantEvaluations) {
      const ratings = singleEvaluation.details.map(
        (detail) => detail.rating || 0,
      ); // 如果 rating 为 undefined，使用 0

      // 计算评价的平均值
      const averageRating =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

      // 创建新的评价详情，只保留平均评分
      const updatedEvaluationDetail: EvaluationDetail = {
        rating: averageRating,
      };

      const updatedSingleEvaluation: EvaluationBySingleParticipant = {
        sample: singleEvaluation.sample,
        details: [updatedEvaluationDetail],
      };

      updatedParticipantEvaluations.push(updatedSingleEvaluation);
    }

    // 创建更新后的受试者评价
    const updatedParticipantEvaluation: SamplesEvaluationByParticipant = {
      participant: participantEvaluation.participant,
      currentParticipantEvaluations: updatedParticipantEvaluations,
    };

    updatedEvaluations.push(updatedParticipantEvaluation);
  }

  const updatedExperimentData: FormattedExperimentData = {
    experiment: originalData.experiment,
    evaluations: updatedEvaluations,
  };

  console.log('求平均后');
  console.log(updatedExperimentData);

  return updatedExperimentData;
}

/**
 * Calculates the individual noise annoyance reference curve using linear regression.
 * @param data An array of arrays representing the data points for the regression analysis.
 * @returns The result of the linear regression analysis.
 */
function getIndividualNoiseAnnoyanceReferenceCurve(data: number[][]): Result {
  return getLinearRegressionResult(data);
}

/**
 * Retrieves the evaluations for pink noise samples from a participant's evaluations and prepares data for individual noise annoyance reference curve calculation.
 * @param participantEvaluation The evaluation data for a participant containing evaluations for different samples.
 * @returns The result of the individual noise annoyance reference curve calculation based on pink noise evaluations.
 */
function getCurrentParticipantEvaluationsForPinkNoise(
  participantEvaluation: SamplesEvaluationByParticipant,
): Result {
  const pinkNoiseEvaluations: EvaluationBySingleParticipant[] = [];

  participantEvaluation.currentParticipantEvaluations.forEach(
    (evaluation: EvaluationBySingleParticipant) => {
      if (evaluation.sample.type === 'reference') {
        pinkNoiseEvaluations.push(evaluation);
      }
    },
  );

  const ratingAndLoudnessLevelData: number[][] = [];

  pinkNoiseEvaluations.forEach((evaluation: EvaluationBySingleParticipant) => {
    const annoyance = evaluation.details[0]?.rating ?? 0;
    const { name } = evaluation.sample;
    const loudnessLevel = parseFloat(name.split('-R')[1]);

    ratingAndLoudnessLevelData.push([
      loudnessLevel,
      Math.log10(annoyance !== 0 ? annoyance : 0.01), // 根据标准如果为0赋值0.01
    ]);
  });

  return getIndividualNoiseAnnoyanceReferenceCurve(ratingAndLoudnessLevelData);
}

/**
 * Calibrates annoyance data based on the standard curve.
 * @param a_i The individual-specific parameter a_i.
 * @param b_i The individual-specific parameter b_i.
 * @param annoyance The annoyance value to be calibrated.
 * @returns The calibrated annoyance value.
 */
function calibrateDataBasedOnTheStandardCurve(
  // eslint-disable-next-line camelcase
  a_i: number,
  // eslint-disable-next-line camelcase
  b_i: number,
  annoyance: number,
): number {
  // eslint-disable-next-line camelcase
  const a_0 = 0.022;
  // eslint-disable-next-line camelcase
  const b_0 = -0.944;
  // eslint-disable-next-line camelcase
  const lgA = (a_0 / a_i) * (Math.log10(annoyance) - b_i) + b_0;
  const A = 10 ** lgA;

  return A > 10 ? 10 : A; // 校准后大于10的按10计算
}

/**
 * Fits and calibrates the ratings to pink noise samples based on individual-specific parameters.
 * @param originalData The original experiment data containing participant evaluations.
 * @returns The updated experiment data with calibrated ratings for pink noise samples.
 */
function fitAndCalibrateToPinkNoiseSamples(
  originalData: FormattedExperimentData,
) {
  const updatedEvaluations: SamplesEvaluationByParticipant[] = [];
  // 遍历每个受试者的评价
  // eslint-disable-next-line no-restricted-syntax
  for (const participantEvaluation of originalData.evaluations) {
    const updatedParticipantEvaluations: EvaluationBySingleParticipant[] = [];
    const resultSet = getCurrentParticipantEvaluationsForPinkNoise(
      participantEvaluation,
    );
    const a: number = resultSet.equation[0];
    const b: number = resultSet.equation[1];

    // eslint-disable-next-line camelcase
    const a_i: number = a === 0 || a === null ? 0.022 : a;
    // eslint-disable-next-line camelcase
    const b_i: number = b === 0 || b === null ? -0.944 : b;

    // 遍历当前受试者的每个声样本评价
    // eslint-disable-next-line no-restricted-syntax
    for (const singleEvaluation of participantEvaluation.currentParticipantEvaluations) {
      const ratings = singleEvaluation.details.map(
        (detail) => detail.rating || 0,
      ); // 如果 rating 为 undefined，使用 0

      const annoyance = ratings[0];

      // 创建新的校准后的烦恼值
      const updatedEvaluationDetail: EvaluationDetail = {
        rating: calibrateDataBasedOnTheStandardCurve(a_i, b_i, annoyance),
      };

      const updatedSingleEvaluation: EvaluationBySingleParticipant = {
        sample: singleEvaluation.sample,
        details: [updatedEvaluationDetail],
      };

      updatedParticipantEvaluations.push(updatedSingleEvaluation);
    }

    // 创建更新后的受试者评价
    const updatedParticipantEvaluation: SamplesEvaluationByParticipant = {
      participant: participantEvaluation.participant,
      currentParticipantEvaluations: updatedParticipantEvaluations,
    };

    updatedEvaluations.push(updatedParticipantEvaluation);
  }

  const updatedExperimentData: FormattedExperimentData = {
    experiment: originalData.experiment,
    evaluations: updatedEvaluations,
  };

  console.log('校准后');
  console.log(updatedExperimentData);

  return updatedExperimentData;
}

/**
 * Calibrates experiment data by averaging ratings and then fitting and calibrating to pink noise samples.
 * @param experimentData The experiment data to be calibrated.
 * @returns The calibrated experiment data, or undefined if input is undefined.
 */
export function calibrateExperimentData(
  experimentData: FormattedExperimentData | undefined,
): FormattedExperimentData | undefined {
  if (!experimentData) {
    return undefined;
  }

  const experimentDataAfterRatingsAveraged =
    getExperimentDataAfterAveragingTheRatingOfSamples(experimentData);

  return fitAndCalibrateToPinkNoiseSamples(experimentDataAfterRatingsAveraged);
}

export function getAverageNoiseAnnoyanceForSamples(
  dataIn: FormattedExperimentData | undefined,
): { [sampleName: string]: number } {
  const sampleNameAndItsAllEvaluations: { [sampleName: string]: number[] } = {};
  const resultMap: { [sampleName: string]: number } = {};

  if (!dataIn) return {};

  dataIn.evaluations.forEach((evaluationBySingleParticipant) => {
    evaluationBySingleParticipant.currentParticipantEvaluations.forEach(
      (sampleEvaluation) => {
        const currentSampleName = sampleEvaluation.sample.name;
        const annoyance = sampleEvaluation.details[0].rating ?? -1;

        if (!sampleNameAndItsAllEvaluations[currentSampleName]) {
          sampleNameAndItsAllEvaluations[currentSampleName] = [];
        }

        sampleNameAndItsAllEvaluations[currentSampleName].push(annoyance);
      },
    );
  });

  function calculateAverage(numbers: number[]): number {
    const sum = numbers.reduce((acc, cur) => acc + cur, 0);
    return sum / numbers.length;
  }

  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const sampleName in sampleNameAndItsAllEvaluations) {
    const annoyance = sampleNameAndItsAllEvaluations[sampleName];
    resultMap[sampleName] = calculateAverage(annoyance);
  }

  console.log(resultMap);
  return resultMap;
}

/**
 * Retrieves function expressions representing linear regression equations for each participant's pink noise evaluations.
 * @param originalData The experiment data containing participant evaluations.
 * @returns An array of objects containing function expressions and participant IDs.
 */
export function getFunctionExpressions(
  originalData: FormattedExperimentData | undefined,
): { fn: string; participantId: number }[] {
  if (!originalData || !originalData.evaluations) {
    return [{ fn: '0 * x + 0', participantId: -Infinity }];
  }

  const expressionsData: { participantId: number; equation: number[] }[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const participantEvaluation of originalData.evaluations) {
    const participant = participantEvaluation.participant.id;
    const resultSet = getCurrentParticipantEvaluationsForPinkNoise(
      participantEvaluation,
    );
    expressionsData.push({
      participantId: participant,
      equation: resultSet.equation,
    });
  }

  return expressionsData.map(({ participantId, equation }) => ({
    fn: `y = ${equation[0]} * x + ${equation[1]}`,
    participantId,
  }));
}
