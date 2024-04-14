import Excel from 'exceljs';
import {
  Evaluation,
  EvaluationBySingleParticipant,
  EvaluationDetail,
  Experiment,
  ExperimentData,
  getSampleByName,
  Participant,
  Sample,
  SamplesEvaluationByParticipant,
} from '../model/ExperimentDataModel';

/**
 * 根据输入的词语或数字返回相应的烦恼度
 *
 * @param value 输入的词语或数字
 * @returns 返回与输入匹配的烦恼度数值，或者返回null（如果输入无法识别）
 */
function getSoundAnnoyanceValue(value?: string | number): number | null {
  if (typeof value === 'number') {
    return value;
  }

  const wordMapping: { [key: string]: number } = {
    一点没有: 0,
    轻微: 2.5,
    一般: 5,
    严重: 7.5,
    非常严重: 10,
  };

  // @ts-ignore
  const lowercaseWord = value.trim().toLowerCase();

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
  let lastProcessedIndex: number = null; // 用于存储上一个处理过的索引

  // @ts-ignore
  row.values.forEach((value, index) => {
    if (index === 1) {
      participant.id = value; // 设置 participant.id
    } else {
      // 处理当前被试者的词语量表/数字量表
      // eslint-disable-next-line no-lonely-if
      if (value !== null && value !== undefined) {
        let sampleName = sampleNamesArr[index];
        let rating = getSoundAnnoyanceValue(value);
        let numberOfEvaluation = ((index - 2) % 3) + 1;

        // 处理缺失的索引
        // @ts-ignore
        if (lastProcessedIndex !== null && index - lastProcessedIndex > 1) {
          for (
            let missingIndex = lastProcessedIndex + 1;
            missingIndex < index;
            missingIndex += 1
          ) {
            sampleName = sampleNamesArr[missingIndex];
            rating = 999;
            numberOfEvaluation = ((missingIndex - 2) % 3) + 1;
            evaluations.push({
              // @ts-ignore
              sampleName,
              rating,
              // @ts-ignore
              numberOfEvaluation,
            });
          }
        }

        evaluations.push({
          sampleName,
          // @ts-ignore
          rating,
          numberOfEvaluation,
        });

        lastProcessedIndex = index; // 更新 lastProcessedIndex
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

function getDetailsFromEvaluationsWithSameName(
  evaluationsWithSameSampleName: any,
): EvaluationDetail[] {
  const details: EvaluationDetail[] = [];

  // @ts-ignore
  evaluationsWithSameSampleName.forEach((evaluation) => {
    const { rating, numberOfEvaluations } = evaluation;
    const existingDetail = details.find(
      (detail) => detail.numberOfEvaluations === numberOfEvaluations,
    );

    if (existingDetail) {
      // 如果已存在与当前评价次数相匹配的详情，则更新它的rating
      existingDetail.rating = rating;
    } else {
      // 如果不存在与当前评价次数相匹配的详情，则创建一个新的详情
      details.push({ rating, numberOfEvaluations });
    }
  });

  return details;
}

export function filterInvalidData(
  experimentData: ExperimentData,
): SamplesEvaluationByParticipant[] {
  const evaluationData = experimentData.evaluations;
  const filteredEvaluationData: SamplesEvaluationByParticipant[] = [];
  const allParticipants: Participant = evaluationData.map((data) => {
    return data.participant;
  });
  const invalidParticipants: Participant[] = []; // 如果被试无效比例在百分之30以上则该被试所有数据无效

  // TODO: 出现次数无法显示切3组数据只push了一组进去

  evaluationData.forEach((participantEvaluationData) => {
    // 对于每一个被试者的所有评价数据(每一行）
    const totalEvaluationsCount: number =
      participantEvaluationData.evaluations.length;
    const currentParticipant = participantEvaluationData.participant;
    let integratedSingleParticipantAllEvaluations: EvaluationBySingleParticipant[] =
      [];

    participantEvaluationData.evaluations.forEach((singleEvaluationData) => {
      // 对于被试者对每个评价记录(每个单元格)，将对同一样本的评价丢入details
      const currentSampleNameToEvaluate = singleEvaluationData.sampleName;
      let details: EvaluationDetail[] = [];

      const evaluationsWithSameSampleName =
        participantEvaluationData.evaluations.filter(
          (evaluation) => evaluation.sampleName === currentSampleNameToEvaluate,
        );

      // 对于每个评价，从所有数据中找到和其为同一样本的数据，将它们的rating和numberOfEvaluations合成一个details
      details = getDetailsFromEvaluationsWithSameName(
        evaluationsWithSameSampleName,
      );

      console.error(details);

      // 返回对应的Sample
      const sample: Sample | undefined = getSampleByName(
        experimentData,
        currentSampleNameToEvaluate,
      );

      const filterDuplicates = integratedSingleParticipantAllEvaluations.filter(
        (evaluation) => evaluation.sample !== sample,
      );

      // 合成单个被试者整理后的评价数据
      filterDuplicates.push({
        // @ts-ignore
        sample,
        details,
      });

      integratedSingleParticipantAllEvaluations = filterDuplicates;
    });

    // 合成SamplesEvaluationByParticipant
    const samplesEvaluationByParticipant: SamplesEvaluationByParticipant = {
      // @ts-ignore
      participant: currentParticipant,
      evaluations: integratedSingleParticipantAllEvaluations,
    };

    console.log(samplesEvaluationByParticipant);
  });

  return filteredEvaluationData;
}

/**
 * 根据提供的样本名称和评估数据生成实验数据。
 *
 * @param {string[]} sampleNamesArr - 样本名称的数组。
 * @param {Evaluation[]} evaluationData - 评估数据的数组。
 * @param {string} [scale] - 可选的比例类型，默认为'word'，如果未提供或无效。
 *
 * @returns {ExperimentData} - 返回包含实验详细信息和评估数据的对象。
 */
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
