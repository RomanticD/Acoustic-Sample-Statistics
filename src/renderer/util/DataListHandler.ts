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

function getIndividualNoiseAnnoyanceReferenceCurve(data: number[][]): Result {
  return getLinearRegressionResult(data);
}

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

export function calibrateExperimentData(
  experimentData: FormattedExperimentData | undefined,
): FormattedExperimentData | undefined {
  if (!experimentData) {
    return undefined;
  }

  const experimentDataAfterRatingsAveraged =
    getExperimentDataAfterAveragingTheRatingOfSamples(experimentData);

  const resultData = fitAndCalibrateToPinkNoiseSamples(
    experimentDataAfterRatingsAveraged,
  );

  return resultData;
}
