import regression, { Result } from 'regression';

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
function logistic(x: number, a: number, b: number, c: number): number {
  return 10 / (1 + Math.exp(-(a * (x - c) + b)));
}

// Logistic 损失函数
function logisticLoss(
  points: Point[],
  a: number,
  b: number,
  c: number,
): number {
  return (
    points.reduce((sum, [x, y]) => {
      const predicted = logistic(x, a, b, c);
      return sum - y * Math.log(predicted) - (1 - y) * Math.log(1 - predicted);
    }, 0) / points.length
  );
}

// 计算损失函数对 a, b 和 c 的偏导数
function gradientDescent(
  points: Point[],
  a: number,
  b: number,
  c: number,
  learningRate: number,
): [number, number, number] | null {
  const n = points.length;
  let gradientA = 0;
  let gradientB = 0;
  let gradientC = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [x, y] of points) {
    const predicted = logistic(x, a, b, c);
    gradientA += (predicted - y) * (x - c);
    gradientB += predicted - y;
    gradientC += (predicted - y) * a * (x - c);
  }

  if (
    Number.isNaN(gradientA) ||
    Number.isNaN(gradientB) ||
    Number.isNaN(gradientC)
  ) {
    console.log('NaN encountered. Stopping iteration.');
    return null;
  }

  gradientA /= n;
  gradientB /= n;
  gradientC /= n;

  // 更新参数
  const newA = a - learningRate * gradientA;
  const newB = b - learningRate * gradientB;
  const newC = c - learningRate * gradientC;

  return [newA, newB, newC];
}

// 梯度下降拟合
export function logisticFit(
  points: Point[],
  iterations: number,
  learningRate: number,
): [number, number, number] {
  let a = 0; // 初始值
  let b = 0; // 初始值
  let c = 0; // 初始值

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < iterations; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const loss = logisticLoss(points, a, b, c); // 计算损失
    const result = gradientDescent(points, a, b, c, learningRate);
    if (result === null) {
      return [a, b, c]; // 如果发现 NaN 值，停止迭代
    }
    [a, b, c] = result;
    // console.log(
    //   `Iteration ${i + 1}: a = ${a}, b = ${b}, c = ${c}, Loss = ${logisticLoss(
    //     points,
    //     a,
    //     b,
    //     c,
    //   )}`,
    // );
    // console.log(`Iteration ${i + 1}: a = ${a}, b = ${b}, c = ${c}, Loss = ${loss}`);
  }

  return [a, b, c];
}

// 生成最终的 logistic 函数表达式
export function generateLogisticExpression(
  a: number,
  b: number,
  c: number,
): string {
  return `y = 10 / (1 + e^(-(${a.toFixed(3)} * (x - ${c.toFixed(
    3,
  )}) + ${b.toFixed(3)})))`;
}
