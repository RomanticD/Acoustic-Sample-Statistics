import Excel from 'exceljs';
import {
  AcousticParameterTableData,
  Sample,
} from '../model/ExperimentDataModel';
import { calculateLN, Point, processN5AndNData } from './Algorithm';

/**
 * Handles acoustic parameter data from an Excel row and organizes it into an array of objects.
 * @param row The Excel row containing the acoustic parameter data.
 * @param sampleWithParametersInfo An array to store sample information with their parameters.
 * @param sampleNamesArr An array containing sample names.
 * @returns An updated array containing sample information with their parameters.
 */
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

/**
 * Formats the provided acoustic parameter data into AcousticParameterTableData structure.
 * @param originData The original acoustic parameter data.
 * @returns Formatted acoustic parameter data in AcousticParameterTableData structure.
 */
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

/**
 * Merges and processes acoustic parameter data into a unified structure.
 * @param originData The original acoustic parameter data.
 * @returns Merged and processed acoustic parameter data.
 */
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
          singleParameterInfo:
            paramInfo.parameterName === 'N5/sone' ||
            paramInfo.parameterName === 'N/sone'
              ? [
                  {
                    value: processN5AndNData(
                      paramInfo.singleParameterInfo.find(
                        (info) => info.channel === 'L',
                      )?.value || 0,
                      paramInfo.singleParameterInfo.find(
                        (info) => info.channel === 'R',
                      )?.value || 0,
                    ),
                  },
                ]
              : [
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

/**
 * Represents a parameter with its associated data points.
 */
export type ParameterWithPoints = {
  parameterName: string;
  points: Point[];
};

/**
 * Retrieves data points for all acoustic parameters based on averaged annoyance values.
 * @param sampleWithItsAveragedAnnoyance An object containing sample names as keys and their averaged annoyance values as values.
 * @param acousticParameterData The acoustic parameter data containing information about samples and their parameters.
 * @returns An array of ParameterWithPoints objects containing data points for each acoustic parameter.
 */
export function getDataPointsForAllAcousticParameters(
  sampleWithItsAveragedAnnoyance: { [sampleName: string]: number },
  acousticParameterData: AcousticParameterTableData | undefined,
): ParameterWithPoints[] {
  if (!acousticParameterData || !acousticParameterData) return [];

  const allParametersName =
    acousticParameterData.allSamplesWithAcousticalParameterInfo[0].parametersInfo.map(
      (item) => {
        return item.parameterName;
      },
    );

  const annoyanceArray: number[] = Object.keys(
    sampleWithItsAveragedAnnoyance,
  ).map((key) => sampleWithItsAveragedAnnoyance[key]);

  const result: ParameterWithPoints[] = [];

  allParametersName.forEach((parameterName) => {
    const points: Point[] = [];

    acousticParameterData.allSamplesWithAcousticalParameterInfo.forEach(
      (sampleWithAllParameters, index) => {
        const y: number = annoyanceArray[index];

        sampleWithAllParameters.parametersInfo.forEach((para) => {
          if (para.parameterName === parameterName) {
            const x = para.singleParameterInfo[0].value;
            points.push([x, y]);
          }
        });
      },
    );

    const dataSet = {
      parameterName,
      points,
    };

    result.push(dataSet);
  });
  console.log(result);
  return result;
}
