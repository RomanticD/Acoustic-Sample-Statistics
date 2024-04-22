import Excel from 'exceljs';
import {
  Evaluation,
  EvaluationBySingleParticipant,
  EvaluationDetail,
  Experiment,
  ExperimentData,
  FormattedExperimentData,
  Participant,
  Sample,
  SamplesEvaluationByParticipant,
} from '../model/ExperimentDataModel';
import { getSampleByName, getSoundAnnoyanceValue } from './Helper';

/**
 * 将Excel行数据转换为评估数据的JSON格式。
 * 这个方法可以处理数字量表和词语量表的数据。
 *
 * @param {Excel.Row} row - 包含评估数据的Excel行对象。
 * @param {string[]} sampleNamesArr - 量表的样本名称数组。
 * @param {Evaluation[]} evaluationData - 存储评估数据的Evaluation对象数组。
 */
export function handleDigitalAndNumberScaleDataToJson(
  row: Excel.Row,
  sampleNamesArr: string[],
  evaluationData: Evaluation[],
): void {
  // @ts-ignore
  const participant: Participant = {};
  const evaluations: {
    sampleName: string;
    rating: number;
    numberOfEvaluation: 1 | 2 | 3;
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
        // @ts-ignore
        if (lastProcessedIndex !== null && index - lastProcessedIndex > 1) {
          // 如果数据缺失，赋值rating为999
          for (
            let missingIndex = lastProcessedIndex + 1;
            missingIndex <= index - 1;
            missingIndex += 1
          ) {
            evaluations.push({
              // @ts-ignore
              sampleName: sampleNamesArr[missingIndex],
              rating: 999,
              // @ts-ignore
              numberOfEvaluation: ((missingIndex - 2) % 3) + 1,
            });
          }
        }
        evaluations.push({
          sampleName: sampleNamesArr[index],
          // @ts-ignore
          rating: getSoundAnnoyanceValue(value),
          // @ts-ignore
          numberOfEvaluation: ((index - 2) % 3) + 1,
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
    if (index !== 1 && value && value !== '') {
      sampleNamesArr[index] = value;
    }
  });
}

/**
 * 根据相同样本名称的评价数据获取评价详情
 *
 * @param evaluationsWithSameSampleName - 相同样本名称的评价数据数组
 *
 * @returns 评价详情数组
 */
function getDetailsFromEvaluationsWithSameName(
  evaluationsWithSameSampleName: {
    sampleName: string;
    rating?: number;
    numberOfEvaluation: 1 | 2 | 3;
  }[],
): EvaluationDetail[] {
  const details: EvaluationDetail[] = [];

  evaluationsWithSameSampleName.forEach((evaluation) => {
    const { rating, numberOfEvaluation } = evaluation;
    const existingDetail = details.find(
      (detail) => detail.numberOfEvaluation === numberOfEvaluation,
    );

    if (existingDetail) {
      // 如果已存在与当前评价次数相匹配的详情，则更新它的rating
      existingDetail.rating = rating;
    } else {
      // 如果不存在与当前评价次数相匹配的详情，则创建一个新的详情
      // @ts-ignore
      details.push({ rating, numberOfEvaluation });
    }
  });
  return details;
}

/**
 * 重新格式化实验数据
 *
 * @param experimentData - 原始实验数据对象
 *
 * @returns 重新格式化的样本评估数据数组
 */
export function reformatExperimentData(
  experimentData: ExperimentData,
): SamplesEvaluationByParticipant[] {
  const evaluationData = experimentData.evaluations;
  const filteredEvaluationData: SamplesEvaluationByParticipant[] = [];

  evaluationData.forEach((participantEvaluationData) => {
    // 对于每一个被试者的所有评价数据(每一行）
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

      // 对于每个评价，从所有数据中找到和其为同一样本的数据，将它们的rating和numberOfEvaluation合成一个details
      details = getDetailsFromEvaluationsWithSameName(
        evaluationsWithSameSampleName,
      );

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
      currentParticipantEvaluations: integratedSingleParticipantAllEvaluations,
    };
    filteredEvaluationData.push(samplesEvaluationByParticipant);
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

/**
 * 获取格式化后的实验数据
 *
 * @param sampleNamesArr - 样本名称数组
 * @param evaluationData - 样本评估数据数组
 * @param scale - 实验规模，可选值为'digital'或'word'
 *
 * @returns 格式化后的实验数据对象
 */
export function getFormattedExperimentData(
  sampleNamesArr: string[],
  evaluationData: SamplesEvaluationByParticipant[],
  scale?: string,
): FormattedExperimentData {
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

/**
 * 根据期望评分的偏差过滤无效的实验数据。
 *
 * @param formattedExperimentData - 要过滤的格式化实验数据。
 * @returns 过滤后的具有有效评估的实验数据。
 */
export function filterInvalidExperimentData(
  formattedExperimentData: FormattedExperimentData,
): FormattedExperimentData {
  // @ts-ignore
  const experimentDataFromInput = formattedExperimentData.experiment;
  const numberOfSamples = formattedExperimentData.experiment.samples.length;
  const MaximumNumberOfInvalidDataAllowed = numberOfSamples * 0.3;
  const { scale } = experimentDataFromInput;
  let invalidSampleCount: number = 0;
  const deviationAllowed: number = scale === 'word' ? 2.5 : 2;
  const evaluationsDataFromInput = formattedExperimentData.evaluations;
  const filteredEvaluationsData: SamplesEvaluationByParticipant[] = [];

  evaluationsDataFromInput.forEach(
    // 对于一个人的所有评价
    (singlePersonEvaluations: SamplesEvaluationByParticipant) => {
      const { participant } = singlePersonEvaluations;
      const { currentParticipantEvaluations } = singlePersonEvaluations;
      let sampleEvaluationInvalid: boolean = false;
      let filteredEvaluationsBySingleParticipant: SamplesEvaluationByParticipant;
      let filteredSingleSampleEvaluationBySingleParticipant: EvaluationBySingleParticipant;
      const filteredSingleSampleEvaluationBySingleParticipantArr: EvaluationBySingleParticipant[] =
        [];

      if (currentParticipantEvaluations.length !== numberOfSamples) {
        // 跳过的空白单元格直接算作无效数据
        invalidSampleCount +=
          numberOfSamples - currentParticipantEvaluations.length;
      }

      currentParticipantEvaluations.forEach(
        // 对单一样本的评价
        (evaluationsForSingleSample: EvaluationBySingleParticipant) => {
          const { details, sample } = evaluationsForSingleSample;
          let filteredEvaluationDetail: EvaluationDetail[] = [];

          for (let i = 0; i < details.length; i += 1) {
            for (let j = i + 1; j < details.length; j += 1) {
              const rating1 = details[i].rating;
              const rating2 = details[j].rating;

              if (
                rating1 !== undefined &&
                rating2 !== undefined &&
                Math.abs(rating1 - rating2) <= deviationAllowed
              ) {
                // 未偏离误差则保留
                if (!filteredEvaluationDetail.includes(details[i])) {
                  filteredEvaluationDetail.push(details[i]);
                }

                if (!filteredEvaluationDetail.includes(details[j])) {
                  filteredEvaluationDetail.push(details[j]);
                }
              } else {
                sampleEvaluationInvalid = true;
              }
            }
          }

          if (sampleEvaluationInvalid) {
            filteredEvaluationDetail = [];
            invalidSampleCount += 1;
            sampleEvaluationInvalid = false;
          }

          filteredSingleSampleEvaluationBySingleParticipant = {
            sample,
            details: filteredEvaluationDetail,
          };

          if (
            filteredSingleSampleEvaluationBySingleParticipant.details.length > 0 // 如果对某样本任意两次评价差值大于误差，去除被试对该样本的评价数据
          ) {
            filteredSingleSampleEvaluationBySingleParticipantArr.push(
              filteredSingleSampleEvaluationBySingleParticipant,
            );
          }
        },
      );
      // 还原filter后的数组
      // eslint-disable-next-line prefer-const
      filteredEvaluationsBySingleParticipant = {
        participant,
        currentParticipantEvaluations:
          filteredSingleSampleEvaluationBySingleParticipantArr,
      };

      if (invalidSampleCount < MaximumNumberOfInvalidDataAllowed) {
        filteredEvaluationsData.push(filteredEvaluationsBySingleParticipant); // 如果无效数据大于百分之三十，则去除该被试所有数据
      }

      invalidSampleCount = 0;
    },
  );

  return {
    experiment: experimentDataFromInput,
    evaluations: filteredEvaluationsData,
  };
}
