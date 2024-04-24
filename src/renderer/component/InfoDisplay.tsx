import React, { useEffect, useState } from 'react';
import './InfoDisplay.css';

interface Data {
  [key: string]: number; // 根据你的数据类型定义
}

function isData(data: any): data is Data {
  return (
    typeof data === 'object' &&
    data !== null &&
    Object.values(data).every((value) => typeof value === 'number')
  );
}

export default function InfoDisplay({
  data,
  count,
}: {
  data: any;
  count: number;
}) {
  // 判断 data 是否为 Data 类型
  const [isCountChanged, setIsCountChanged] = useState(false);

  useEffect(() => {
    setIsCountChanged(true);

    const timer = setTimeout(() => {
      setIsCountChanged(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [count]);

  if (!isData(data)) {
    return (
      <div className="info-display">
        <div className="none-data-div">
          <h3 className="not-choose-message">已确认选择的实验文件</h3>
          <h1 className="number-of-selection-message">
            <span className={isCountChanged ? 'count-change' : ''}>
              {count}
            </span>{' '}
            / 2
          </h1>
        </div>
      </div>
    );
  }
  const sortedData = Object.entries(data).sort(([keyA], [keyB]) => {
    if (keyA.length !== keyB.length) {
      return keyA.length - keyB.length;
    }
    return keyA.localeCompare(keyB);
  });

  return (
    <div className="info-display">
      <div className="data-container">
        <h3>校准后样本平均烦恼度</h3>
        <table>
          <thead>
            <tr>
              <th>样本名称</th>
              <th>烦恼度</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
