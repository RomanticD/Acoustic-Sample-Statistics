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

export function getExperimentDataAfterAveragingTheRatingOfSamples(
  originalData: FormattedExperimentData | undefined,
): FormattedExperimentData | undefined {
  const updatedEvaluations: SamplesEvaluationByParticipant[] = [];
  if (!originalData) {
    return undefined;
  }
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

  // 创建并返回更新后的实验数据
  return {
    experiment: originalData.experiment,
    evaluations: updatedEvaluations,
  };
}
