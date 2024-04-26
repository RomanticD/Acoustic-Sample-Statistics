import React from 'react';
import Latex from 'react-latex';

function LatexComponent(props) {
  // eslint-disable-next-line react/prop-types
  const { equation } = props;

  // 解析线性函数
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const parseLinearEquation = (equation) => {
    const pattern = /y\s*=\s*(-?\d+(\.\d+)?)\s*\*\s*x\s*\+\s*(-?\d+(\.\d+)?)/;

    // 执行匹配
    // eslint-disable-next-line react/prop-types
    const match = equation.match(pattern);

    if (!match) {
      throw new Error('Invalid equation format');
    }

    // 提取a和b的值
    const a = parseFloat(match[1]);
    const b = parseFloat(match[3]);

    return { a, b };
  };

  // 将线性函数转换为LaTeX格式
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const convertToLatex = (equation) => {
    if (!equation) return null;

    const { a, b } = parseLinearEquation(equation);

    if (b > 0) {
      return `y = ${a}x + ${b}`;
    }
    return `y = ${a}x - ${Math.abs(b)}`;
  };

  const latexEquation = convertToLatex(equation);

  return (
    <div>
      <Latex>{`$${latexEquation}$`}</Latex>
    </div>
  );
}

export default LatexComponent;
