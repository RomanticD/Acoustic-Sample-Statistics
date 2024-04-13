import React, { useState } from 'react';
import './FileInputUtil.css';
import Excel from 'exceljs';
import { Evaluation } from '../model/ExperimentDataModel';
import {
  handleScaleDataToJson,
  handleSampleNames,
} from '../util/ScaleFormDataHandler';

function ExcelToJsonConverter() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [fileName, setFileName] = useState('');

  // @ts-ignore
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      console.error('File selection canceled');
    }
  };

  const handleConvert = async () => {
    console.clear();

    if (!file) {
      console.error('No file selected');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      // @ts-ignore
      const buffer = e.target.result;
      // @ts-ignore
      const data = new Uint8Array(buffer);
      let evaluationData: Evaluation[] = [];
      const sampleNamesArr: string[] = [];

      try {
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(data);

        let isFirstSheet = true; // 标记是否为第一张工作表

        workbook.eachSheet((worksheet) => {
          if (isFirstSheet) {
            // 只处理第一张工作表
            worksheet.eachRow((row, rowNumber) => {
              console.log('Row Values:', row.values);

              if (rowNumber !== 1) {
                evaluationData = handleScaleDataToJson(row, sampleNamesArr);
              } else {
                handleSampleNames(row, sampleNamesArr);
              }
            });

            isFirstSheet = false;
          }
        });

        setJsonData(JSON.stringify(evaluationData, null, 2));
      } catch (error) {
        console.error('Error loading workbook:', error);
      }
    };

    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="file-input-container">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label htmlFor="file-input" className="file-input-label">
        <span className="upload-icon">📁</span> {fileName || '选择文件'}
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
