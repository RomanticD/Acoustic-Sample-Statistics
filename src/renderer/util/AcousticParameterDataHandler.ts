import Excel from 'exceljs';

export default function handleAcousticParameterData(
  row: Excel.Row,
  sampleWithParametersInfo: any[],
  sampleNamesArr: string[],
): any[] {
  let currentSampleName: string = '';
  // @ts-ignore
  const rowInfo = [];
  // @ts-ignore
  row.values.forEach((value, index) => {
    let parameterName: string = '';
    let channel: string = '';

    if (index === 1 && value !== '声学参量' && value !== '声样本编号') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      currentSampleName = value;
    } else if (value !== 'L' && value !== 'R') {
      // eslint-disable-next-line no-unused-expressions,@typescript-eslint/no-unused-vars
      index % 2 === 0 ? (channel = 'L') : (channel = 'R');
      parameterName = sampleNamesArr[index];

      const collectedCellInfo = {
        parameterName,
        channel,
        value,
      };

      rowInfo.push(collectedCellInfo);
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
