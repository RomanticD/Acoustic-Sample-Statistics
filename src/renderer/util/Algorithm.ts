import regression from 'regression';

export default function getLinearRegressionResult(data: number[][]): any {
  // @ts-ignore
  return regression.linear(data, {
    precision: 3,
  });
}
