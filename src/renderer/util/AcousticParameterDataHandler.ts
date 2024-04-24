import Excel from 'exceljs';
import {
  AcousticParameterTableData,
  Sample,
} from '../model/ExperimentDataModel';
import { calculateLN } from './Algorithm';

export default function handleAcousticParameterData(
  row: Excel.Row,
  sampleWithParametersInfo: any[],
  sampleNamesArr: string[],
): any[] {
  let currentSampleName: string = '';
  // @ts-ignore
  const rowInfo = [];
  let currentParameterInfo: any[] = [];
  let LNInfo: any[] = [];
  // @ts-ignore
  row.values.forEach((value, index) => {
    let parameterName: string = '';
    let channel: string = '';

    if (index === 1 && value !== '声学参量' && value !== '声样本编号') {
      currentSampleName = value;
    } else if (value !== 'L' && value !== 'R') {
      // eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-vars
      index % 2 === 0 ? (channel = 'L') : (channel = 'R');
      parameterName = sampleNamesArr[index];

      if (channel === 'L') {
        currentParameterInfo = [];
        LNInfo = [];
        currentParameterInfo.push({
          channel,
          value,
        });

        if (parameterName === 'N/sone') {
          LNInfo.push({
            channel,
            value: calculateLN(value),
          });
        }
      } else {
        currentParameterInfo.push({
          channel,
          value,
        });

        if (parameterName === 'N/sone') {
          LNInfo.push({
            channel,
            value: calculateLN(value),
          });
        }

        const collectedCellInfo = {
          parameterName,
          singleParameterInfo: currentParameterInfo,
        };

        rowInfo.push(collectedCellInfo);
        if (parameterName === 'N/sone') {
          // 根据N计算LN，增加LN的数据
          rowInfo.push({
            parameterName: 'LN/phon',
            singleParameterInfo: LNInfo,
          });
        }
      }
    }
  });

  if (rowInfo.length > 0) {
    sampleWithParametersInfo.push({
      sampleName: currentSampleName,
      // @ts-ignore
      parametersInfo: rowInfo,
    });
  }
  return sampleWithParametersInfo;
}

export function getFormattedAcousticParameterData(
  originData: any[],
): AcousticParameterTableData {
  const samples: Sample[] = originData.map((item, index) => ({
    id: index + 1,
    name: item.sampleName,
    type: 'test',
  }));

  return {
    experiment: { scale: 'acoustic parameter', samples },
    allSamplesWithAcousticalParameterInfo: originData,
  };
}

export function acousticParameterDataAfterMerging(
  originData: AcousticParameterTableData | undefined,
): AcousticParameterTableData | undefined {
  if (!originData) return undefined;

  return {
    experiment: {
      ...originData.experiment,
      samples: [...originData.experiment.samples],
    },
    allSamplesWithAcousticalParameterInfo:
      originData.allSamplesWithAcousticalParameterInfo.map((sampleInfo) => ({
        sampleName: sampleInfo.sampleName,
        parametersInfo: sampleInfo.parametersInfo.map((paramInfo) => ({
          parameterName: paramInfo.parameterName,
          singleParameterInfo: [
            {
              value:
                paramInfo.singleParameterInfo.reduce(
                  (acc, curr) => acc + curr.value,
                  0,
                ) / paramInfo.singleParameterInfo.length,
            },
          ],
        })),
      })),
  };
}
