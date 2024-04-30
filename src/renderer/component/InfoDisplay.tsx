import React, { useEffect, useState } from 'react';
import './InfoDisplay.css';
import LatexComponent from './KaTeX';
import { exportToExcel } from '../util/ExportExperimentData';

interface SAData {
  [key: string]: number;
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

export default function InfoDisplay({
  data,
  count,
}: {
  data: any;
  count: number;
}) {
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

  const getSortedSAData = () => {
    return Object.entries(data).sort(([keyA], [keyB]) => {
      if (keyA.length !== keyB.length) {
        return keyA.length - keyB.length;
      }
      return keyA.localeCompare(keyB);
    });
  };

  const getSortedPFData = () => {
    // @ts-ignore
    return data.sort((a, b) => a.participantId - b.participantId);
  };

  const handleExport = (type: 'sa' | 'pf') => {
    if (type === 'sa') {
      const sortedData = getSortedSAData();
      exportToExcel(
        '样本数据',
        [
          { header: '样本名称', key: 'name', width: 20 },
          { header: '烦恼度', key: 'value', width: 15 },
        ],
        sortedData.map(([key, value]) => ({
          name: key,
          value: value.toFixed(3),
        })),
        'sample_with_annoyance.xlsx',
      );
    } else {
      const sortedData = getSortedPFData();
      exportToExcel(
        '拟合数据',
        [
          { header: '被试ID', key: 'participantId', width: 15 },
          { header: '拟合函数', key: 'fn', width: 20 },
        ],
        sortedData,
        'fitting_data.xlsx',
      );
    }
  };

  return (
    <div className="info-display">
      <div className="data-container">
        <div className="header-container">
          <h3 className="header-title">
            {isSAData(data) ? '校准后样本平均烦恼度' : '校准后样本拟合数据'}
          </h3>
          <button
            type="button"
            onClick={() => handleExport(isSAData(data) ? 'sa' : 'pf')}
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
              <th>{isSAData(data) ? '样本名称' : '被试 ID'}</th>
              <th>{isSAData(data) ? '烦恼度' : '拟合函数'}</th>
            </tr>
          </thead>
          <tbody>
            {isSAData(data)
              ? getSortedSAData().map(([key, value]) => (
                  <tr key={key}>
                    <td className="table-row-key">{key}</td>
                    <td>{value.toFixed(3)}</td>
                  </tr>
                ))
              : // @ts-ignore
                getSortedPFData().map((item) => (
                  <tr key={item.participantId}>
                    <td className="table-row-key">{item.participantId}</td>
                    {/* <td>{item.fn}</td> */}
                    <td>
                      <LatexComponent equation={item.fn} />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
