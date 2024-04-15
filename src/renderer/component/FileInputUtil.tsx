import React, { useState } from 'react';
import './FileInputUtil.css';
import Excel from 'exceljs';
import { Evaluation } from '../model/ExperimentDataModel';
import {
  handleScaleDataToJson,
  handleSampleNames,
  filterInvalidData,
  getExperimentData,
  getFormattedExperimentData,
} from '../util/ScaleFormDataHandler';

let scale = '';

function ExcelToJsonConverter() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [fileName, setFileName] = useState('');

  // @ts-ignore
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const fileName = selectedFile.name;

      if (fileName.includes('数字') || fileName.includes('词语')) {
        setFile(selectedFile);
        setFileName(fileName);

        if (fileName.includes('数字')) {
          scale = 'digital';
        } else {
          scale = 'word';
        }
      } else {
        // 文件名不符合要求，给出警告并重置文件选择
        window.alert('请选择量表类型文件');
        e.target.value = null; // 重置文件选择
        setFileName('选择文件'); // 重置文件名显示
      }
    } else {
      window.alert('文件选择失效');
    }
  };

  const handleConvert = async () => {
    console.clear();

    if (!file) {
      window.alert('未选择文件！');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      // @ts-ignore
      const buffer = e.target.result;
      // @ts-ignore
      const data = new Uint8Array(buffer);
      const evaluationData: Evaluation[] = [];
      const sampleNamesArr: string[] = [];

      try {
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(data);
        let isFirstSheet = true; // 标记是否为第一张工作表

        workbook.eachSheet((worksheet) => {
          if (isFirstSheet) {
            // 只处理第一张工作表
            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber !== 1) {
                handleScaleDataToJson(row, sampleNamesArr, evaluationData);
              } else {
                handleSampleNames(row, sampleNamesArr);
              }
            });
            isFirstSheet = false;
          }
        });

        const experimentData = getExperimentData(
          sampleNamesArr,
          evaluationData,
          scale,
        );

        const formattedExperimentData = getFormattedExperimentData(
          sampleNamesArr,
          filterInvalidData(experimentData),
          scale,
        );

        setJsonData(JSON.stringify(formattedExperimentData, null, 2));

        console.log(experimentData);
      } catch (error) {
        console.error(error);
        // @ts-ignore
        window.alert(`Error:${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="file-input-container">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="file-input" className="file-input-label">
        <span className="upload-icon">📁</span> {fileName || '选择量表'}
      </label>
      <input
        id="file-input"
        type="file"
        accept=".xls,.xlsx"
        // @ts-ignore
        onChange={handleFileChange}
        className="file-input"
      />
      <button type="button" onClick={handleConvert} className="button">
        Convert
      </button>
      <pre className="json-data">{jsonData}</pre>
    </div>
  );
}

export default ExcelToJsonConverter;
