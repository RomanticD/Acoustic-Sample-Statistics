import regression, { Result } from 'regression';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataSample = [
  [50, Math.log10(1)],
  [60, Math.log10(2)],
  [70, Math.log10(2)],
  [80, Math.log10(4)],
  [90, Math.log10(8)],
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dataTest = [
  [30, -0.432],
  [35, -0.319],
  [40, -0.144],
  [45, 0.158],
  [50, 0.281],
  [55, 0.344],
  [60, 0.394],
  [65, 0.525],
  [70, 0.599],
  [75, 0.741],
  [80, 0.821],
  [85, 0.906],
  [90, 0.96],
  [95, 0.991],
];

export default function getLinearRegressionResult(data: number[][]): Result {
  // @ts-ignore
  return regression.linear(data, {
    precision: 3,
  });
}

export function processN5AndNData(NL: number, NR: number): number {
  const exponentL = 1 / 0.669;
  const exponentR = 1 / 0.699;

  const termL = NL ** exponentL;
  const termR = NR ** exponentR;

  const NB = (termL + termR) ** 0.669;

  return NB;
}

export function calculateLN(N: any): number {
  const numberN = Number(N);

  if (Number.isNaN(N)) {
    return NaN;
  }

  const LN = 40 + 33.22 * Math.log10(numberN);
  return LN;
}
