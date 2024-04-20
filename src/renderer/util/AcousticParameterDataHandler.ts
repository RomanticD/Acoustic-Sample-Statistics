import Excel from 'exceljs';
import {
  AcousticParameterTableData,
  Sample,
} from '../model/ExperimentDataModel';

export default function handleAcousticParameterData(
  row: Excel.Row,
  sampleWithParametersInfo: any[],
  sampleNamesArr: string[],
): any[] {
  let currentSampleName: string = '';
  // @ts-ignore
  const rowInfo = [];
  let currentParameterInfo: any[] = [];
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
        currentParameterInfo.push({
          channel,
          value,
        });
      } else {
        currentParameterInfo.push({
          channel,
          value,
        });

        const collectedCellInfo = {
          parameterName,
          singleParameterInfo: currentParameterInfo,
        };
        rowInfo.push(collectedCellInfo);
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
