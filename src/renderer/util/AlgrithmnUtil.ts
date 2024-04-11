// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ExperimentData,
  Evaluation,
  Sample,
} from '../model/ExperimentDataModel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function filterInvalidData(experimentData: ExperimentData): ExperimentData {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { experiment, evaluations } = experimentData;

  // 计算每个参与者对每个声样本的评分次数和评分值
  const participantEvaluationsMap: Map<
    number,
    Map<number, number[]>
  > = new Map();
  evaluations.forEach((evaluation) => {
    const { participant, evaluations: participantEvaluations } = evaluation;
    const participantId = participant.id;

    if (!participantEvaluationsMap.has(participantId)) {
      participantEvaluationsMap.set(participantId, new Map());
    }

    participantEvaluations.forEach((evalItem) => {
      const { sampleId, rating } = evalItem;
      if (!participantEvaluationsMap.get(participantId)?.has(sampleId)) {
        participantEvaluationsMap.get(participantId)?.set(sampleId, []);
      }
      participantEvaluationsMap.get(participantId)?.get(sampleId)?.push(rating);
    });
  });

  // 计算误判声样本数和总评价声样本数
  let misjudgmentCount = 0;
  let totalCount = 0;

  participantEvaluationsMap.forEach((sampleMap) => {
    sampleMap.forEach((ratings) => {
      totalCount += ratings.length;
      for (let i = 0; i < ratings.length - 1; i += 1) {
        if (
          Math.abs(ratings[i] - ratings[i + 1]) > 1 && // 词语量表评分差异大于1
          (ratings[i] !== Math.round(ratings[i]) ||
            ratings[i + 1] !== Math.round(ratings[i + 1])) &&
          Math.abs(ratings[i] - ratings[i + 1]) > 2 // 数字量表评分差异大于2
        ) {
          misjudgmentCount += 1;
          break;
        }
      }
    });
  });

  // 计算误判声样本比例
  const misjudgmentRatio = misjudgmentCount / totalCount;

  // 根据误判声样本比例剔除无效数据
  if (misjudgmentRatio > 0.3) {
    return { experiment: { samples: [] }, evaluations: [] }; // 返回空数据
  }

  // 返回原始数据
  return experimentData;
}
