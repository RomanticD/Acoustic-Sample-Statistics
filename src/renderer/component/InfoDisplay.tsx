import React, { useEffect, useState } from 'react';
import './InfoDisplay.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface SAData {
  [key: string]: number; // 根据你的数据类型定义
}

interface PFData {
  fn: string;
  participantId: number;
}

function isSAData(data: any): data is SAData {
  return (
    typeof data === 'object' &&
    data !== null &&
    Object.values(data).every((value) => typeof value === 'number')
  );
}

function isPFData(data: any): data is PFData[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.fn === 'string' &&
        typeof item.participantId === 'number',
    )
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

function exportPFDataToExcel(sortedData: PFData[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('拟合数据');

  // 设置表头
  worksheet.columns = [
    { header: '被试ID', key: 'participantId', width: 15 },
    { header: '拟合函数', key: 'fn', width: 20 },
  ];

  // 填充数据
  sortedData.forEach((item) => {
    worksheet.addRow({ participantId: item.participantId, fn: item.fn });
  });

  // 生成Excel文件
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'fitting_data.xlsx');
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

  if (!isSAData(data) && !isPFData(data)) {
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
  if (isSAData(data)) {
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

  if (isPFData(data)) {
    const sortedData = data.sort((a, b) => a.participantId - b.participantId);

    return (
      <div className="info-display">
        <div className="data-container">
          <div className="header-container">
            <h3 className="header-title">校准后样本拟合数据</h3>
            <button
              type="button"
              onClick={() => exportPFDataToExcel(sortedData)}
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
                <th>被试ID</th>
                <th>拟合函数</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item) => (
                <tr key={item.participantId}>
                  <td className="table-row-key">{item.participantId}</td>
                  <td>{item.fn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
