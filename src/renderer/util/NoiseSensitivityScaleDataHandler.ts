import Excel from 'exceljs';
import {
  Experiment,
  FormattedNoiseSensitivityScaleData,
  NoiseSensitivityScaleData,
  NoiseSensitivityScaleDataExperimentData,
  Participant,
  QuestionInfo,
  Sample,
} from '../model/ExperimentDataModel';

export function handleNoiseSensitivityScaleData(
  row: Excel.Row,
  noiseSensitivityScaleData: NoiseSensitivityScaleData[],
): void {
  // @ts-ignore
  let lastProcessedIndex: number = null; // 用于存储上一个处理过的索引
  // @ts-ignore
  const currentParticipant: Participant = {};
  // @ts-ignore
  row.values.forEach((value, index) => {
    if (index === 1) {
      currentParticipant.id = value; // 设置 participant.id
    } else {
      // 处理当前被试者的词语量表/数字量表
      // eslint-disable-next-line no-lonely-if
      if (value !== null && value !== undefined) {
        // @ts-ignore
        if (lastProcessedIndex !== null && index - lastProcessedIndex > 1) {
          // 如果数据缺失
          for (
            let missingIndex = lastProcessedIndex + 1;
            missingIndex <= index - 1;
            missingIndex += 1
          ) {
            noiseSensitivityScaleData.push({
              currentParticipantEvaluation: {
                questionId: index - 1,
                sensitiveValue: 3,
              },
              participant: currentParticipant,
            });
          }
        }

        noiseSensitivityScaleData.push({
          currentParticipantEvaluation: {
            questionId: index - 1,
            sensitiveValue: value,
          },
          participant: currentParticipant,
        });

        lastProcessedIndex = index; // 更新 lastProcessedIndex
      }
    }
  });
}

export function getNoiseSensitivityScaleData(
  sampleNamesArr: string[],
  noiseSensitivityScaleData: NoiseSensitivityScaleData[],
): NoiseSensitivityScaleDataExperimentData {
  const filteredArrayWithoutNull = sampleNamesArr.filter(
    (item) => item !== null,
  );
  const uniqueSamples = Array.from(new Set(filteredArrayWithoutNull));

  const samples: Sample[] = uniqueSamples.map((sampleName, index) => {
    const type = 'test';
    return {
      id: index + 1,
      name: sampleName,
      type,
    };
  });

  const experiment: Experiment = {
    scale: 'noise sensitivity',
    samples,
  };

  return { evaluations: noiseSensitivityScaleData, experiment };
}

export function getFormattedNoiseSensitivityScaleData(
  originData: NoiseSensitivityScaleDataExperimentData,
): FormattedNoiseSensitivityScaleData {
  const originExperiment: Experiment = originData.experiment;
  const originEvaluations: NoiseSensitivityScaleData[] = originData.evaluations;
  const evaluationBySingleParticipant: {
    participant: Participant;
    evaluations: QuestionInfo[];
  }[] = [];

  // 分类 originEvaluations 中的数据
  const groupedEvaluations: { [key: string]: NoiseSensitivityScaleData[] } = {};

  originEvaluations.forEach((evaluation) => {
    const key = evaluation.participant.id.toString();

    if (!groupedEvaluations[key]) {
      groupedEvaluations[key] = [];
    }

    groupedEvaluations[key].push(evaluation);
  });

  // 将分类后的数据放入 evaluationBySingleParticipant
  // eslint-disable-next-line no-restricted-syntax,@typescript-eslint/no-unused-vars
  for (const [participantId, evaluations] of Object.entries(
    groupedEvaluations,
  )) {
    const { participant } = evaluations[0]; // 假设每个 participant 对象中的数据都是相同的
    const EvaluationQuestionInfo: QuestionInfo[] = evaluations.map(
      (evaluation) => ({
        questionId: evaluation.currentParticipantEvaluation.questionId,
        sensitiveValue: evaluation.currentParticipantEvaluation.sensitiveValue,
      }),
    );

    evaluationBySingleParticipant.push({
      participant,
      evaluations: EvaluationQuestionInfo,
    });
  }

  return {
    experiment: originExperiment,
    allEvaluations: {
      currentParticipantEvaluation: evaluationBySingleParticipant,
    },
  };
}
