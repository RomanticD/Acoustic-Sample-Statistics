import {
  AcousticParameterTableData,
  EvaluationBySingleParticipant,
  EvaluationDetail,
  FormattedExperimentData,
  FormattedNoiseSensitivityScaleData,
  SamplesEvaluationByParticipant,
} from '../model/ExperimentDataModel';

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

  console.log(updatedExperimentData);

  return updatedExperimentData;
}

function getCurrentParticipantEvaluationsForPinkNoise(
  participantEvaluation: SamplesEvaluationByParticipant,
): number[][] {
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

    ratingAndLoudnessLevelData.push([loudnessLevel, Math.log10(annoyance)]);
  });

  return ratingAndLoudnessLevelData;
}

function fitAndCalibrateToPinkNoiseSamples(
  originalData: FormattedExperimentData,
) {
  const updatedEvaluations: SamplesEvaluationByParticipant[] = [];
  // 遍历每个受试者的评价
  // eslint-disable-next-line no-restricted-syntax
  for (const participantEvaluation of originalData.evaluations) {
    const updatedParticipantEvaluations: EvaluationBySingleParticipant[] = [];

    console.log(
      getCurrentParticipantEvaluationsForPinkNoise(participantEvaluation),
    );

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
