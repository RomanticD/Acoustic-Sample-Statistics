import Excel from 'exceljs';
import {
  Experiment,
  NoiseSensitivityScaleData,
  NoiseSensitivityScaleDataExperimentData,
  Participant,
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
              evaluation: { questionId: index - 1, sensitiveValue: 3 },
              participant: currentParticipant,
            });
          }
        }

        noiseSensitivityScaleData.push({
          evaluation: { questionId: index - 1, sensitiveValue: value },
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
      id: index,
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
