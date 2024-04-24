import React, { useEffect, useState } from 'react';
import './InfoDisplay.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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

function exportSampleWithAnnoyanceDataToExcel(sortedData: [string, number][]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('样本数据');

  // 设置表头
  worksheet.columns = [
    { header: '样本名称', key: 'name', width: 20 },
    { header: '烦恼度', key: 'value', width: 15 },
  ];

  // 填充数据
  sortedData.forEach(([key, value]) => {
    worksheet.addRow({ name: key, value: value.toFixed(3) });
  });

  // 生成Excel文件
  // eslint-disable-next-line promise/catch-or-return,promise/always-return
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'sample_with_annoyance.xlsx');
  });
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
        <div className="header-container">
          <h3 className="header-title">校准后样本平均烦恼度</h3>
          <button
            type="button"
            onClick={() => exportSampleWithAnnoyanceDataToExcel(sortedData)}
            className="export-button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-table-share"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#6f32be"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 21h-7a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8" />
              <path d="M3 10h18" />
              <path d="M10 3v18" />
              <path d="M16 22l5 -5" />
              <path d="M21 21.5v-4.5h-4.5" />
            </svg>
          </button>
        </div>
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
                <td className="table-row-key">{key}</td>
                <td>{value.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
