import Excel from 'exceljs';
import {
  Evaluation,
  Experiment,
  ExperimentData,
  Participant,
  Sample,
} from '../model/ExperimentDataModel';

/**
 * 根据输入的词语或数字返回相应的烦恼度
 *
 * @param word 输入的词语或数字
 * @returns 返回与输入匹配的烦恼度数值，或者返回null（如果输入无法识别）
 */
function getSoundAnnoyanceValue(word: string | number): number | null {
  if (typeof word === 'number') {
    return word;
  }

  const wordMapping: { [key: string]: number } = {
    一点没有: 0,
    轻微: 2.5,
    一般: 5,
    严重: 7.5,
    非常严重: 10,
  };

  const lowercaseWord = word.trim().toLowerCase();

  if (lowercaseWord in wordMapping) {
    return wordMapping[lowercaseWord];
  }
  return null;
}

/**
 * 将Excel行数据转换为评估数据的JSON格式。
 * 这个方法可以处理数字量表和词语量表的数据。
 *
 * @param {Excel.Row} row - 包含评估数据的Excel行对象。
 * @param {string[]} sampleNamesArr - 量表的样本名称数组。
 * @param {Evaluation[]} evaluationData - 存储评估数据的Evaluation对象数组。
 */
export function handleScaleDataToJson(
  row: Excel.Row,
  sampleNamesArr: string[],
  evaluationData: Evaluation[],
): void {
  // @ts-ignore
  const participant: Participant = {};
  const evaluations: {
    sampleName: string;
    rating: number;
    numberOfEvaluations: 1 | 2 | 3;
  }[] = [];

  // @ts-ignore
  row.values.forEach((value, index) => {
    if (index === 1) {
      participant.id = value; // 设置 participant.id
    } else {
      // 处理当前被试者的词语量表/数字量表
      // eslint-disable-next-line no-lonely-if
      if (value !== null && value !== undefined) {
        const sampleName = sampleNamesArr[index];
        const rating = getSoundAnnoyanceValue(value);
        const numberOfEvaluation = ((index - 2) % 3) + 1; // 1, 2, 或 3

        evaluations.push({
          sampleName,
          // @ts-ignore
          rating,
          // @ts-ignore
          numberOfEvaluation,
        });
      }
    }
  });

  const evaluation: Evaluation = {
    participant,
    evaluations,
  };

  evaluationData.push(evaluation);
}

/**
 * 更新样本名称数组，将Excel行中的非空值设置为样本名称。
 *
 * @param {Excel.Row} row - 包含样本名称的Excel行对象。
 * @param {string[]} sampleNamesArr - 量表的样本名称数组。
 */
export function handleSampleNames(
  row: Excel.Row,
  sampleNamesArr: string[],
): void {
  // @ts-ignore
  row.values.forEach((value: any, index: number) => {
    if (index !== 1 && value) {
      sampleNamesArr[index] = value;
    }
  });
}

export function filterInvalidEvaluations(
  evaluationData: Evaluation[],
): Evaluation[] {
  return evaluationData;
}

export function getExperimentData(
  sampleNamesArr: string[],
  evaluationData: Evaluation[],
  scale?: string,
): ExperimentData {
  const filteredArrayWithoutNull = sampleNamesArr.filter(
    (item) => item !== null,
  );
  const uniqueSamples = Array.from(new Set(filteredArrayWithoutNull));

  const samples: Sample[] = uniqueSamples.map((sampleName, index) => {
    const type = sampleName.includes('-') ? 'reference' : 'test';
    return {
      id: index,
      name: sampleName,
      type,
    };
  });

  const experiment: Experiment = {
    scale: scale === 'digital' ? 'digital' : 'word',
    samples,
  };

  return {
    experiment,
    evaluations: evaluationData,
  };
}
