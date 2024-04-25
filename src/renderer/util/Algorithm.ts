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

export type Point = [number, number];

// Logistic 函数
function logistic(x: number, a: number, b: number): number {
  return 10 / (1 + Math.exp(-(a * x + b)));
}

// Logistic 损失函数
function logisticLoss(points: Point[], a: number, b: number): number {
  return (
    points.reduce((sum, [x, y]) => {
      const predicted = logistic(x, a, b);
      return sum - y * Math.log(predicted) - (1 - y) * Math.log(1 - predicted);
    }, 0) / points.length
  );
}

// 计算损失函数对 a 和 b 的偏导数
function gradientDescent(
  points: Point[],
  a: number,
  b: number,
  learningRate: number,
): [number, number] {
  const n = points.length;
  let gradientA = 0;
  let gradientB = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [x, y] of points) {
    const predicted = logistic(x, a, b);
    gradientA += (predicted - y) * x;
    gradientB += predicted - y;
  }

  gradientA /= n;
  gradientB /= n;

  // 更新参数
  const newA = a - learningRate * gradientA;
  const newB = b - learningRate * gradientB;

  return [newA, newB];
}

// 梯度下降拟合
export function logisticFit(
  points: Point[],
  iterations: number,
  learningRate: number,
): [number, number] {
  let a = 0; // 初始值
  let b = 0; // 初始值

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < iterations; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const loss = logisticLoss(points, a, b); // 计算损失
    [a, b] = gradientDescent(points, a, b, learningRate);
    // console.log(
    //   `Iteration ${i + 1}: a = ${a}, b = ${b}, Loss = ${logisticLoss(
    //     points,
    //     a,
    //     b,
    //   )}`,
    // );
    // console.log(`Iteration ${i + 1}: a = ${a}, b = ${b}, Loss = ${loss}`);
  }

  return [a, b];
}

// 生成最终的 logistic 函数表达式
export function generateLogisticExpression(a: number, b: number): string {
  return `y = 10 / (1 + e^(-(${a.toFixed(3)} * x + ${b.toFixed(3)})))`;
}
