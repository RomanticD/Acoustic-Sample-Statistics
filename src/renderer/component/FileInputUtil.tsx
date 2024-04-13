import React, { useState } from 'react';
import './FileInputUtil.css';
import Excel from 'exceljs';
import { Evaluation, Participant } from '../model/ExperimentDataModel';
import getWorryLevel from '../util/WordScaleFormDataHandler';

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
      const evaluationData: Evaluation[] = [];

      try {
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(data);

        let isFirstSheet = true; // 标记是否为第一张工作表
        const sampleNamesArr: string[] = [];

        workbook.eachSheet((worksheet) => {
          if (isFirstSheet) {
            // 只处理第一张工作表
            worksheet.eachRow((row, rowNumber) => {
              console.log('Row Values:', row.values);

              // @ts-ignore
              const participant: Participant = {};
              const evaluations: {
                sampleName: string;
                rating: number;
                numberOfEvaluations: 1 | 2 | 3;
              }[] = [];

              if (rowNumber !== 1) {
                // @ts-ignore
                row.values.forEach((value, index) => {
                  if (index === 1) {
                    participant.id = value; // 设置 participant.id
                    console.log(participant.id);
                  } else {
                    // 处理当前被试者的词语量表
                    // eslint-disable-next-line no-lonely-if
                    if (value !== null && value !== undefined) {
                      const sampleName = sampleNamesArr[index];
                      const rating = getWorryLevel(value);
                      const numberOfEvaluation = ((index - 2) % 3) + 1; // 1, 2, 或 3

                      evaluations.push({
                        sampleName,
                        // @ts-ignore
                        rating,
                        // @ts-ignore
                        numberOfEvaluation,
                      });
                    }
                  }
                });

                const evaluation: Evaluation = {
                  participant,
                  evaluations,
                };

                evaluationData.push(evaluation);
                console.log('EvaluationData:', evaluationData);
              } else {
                // @ts-ignore
                row.values.forEach((value, index) => {
                  if (index !== 1 && value) {
                    sampleNamesArr[index] = value;
                  }
                });
                console.log('sample names: ', sampleNamesArr);
                console.log('arr[2]: ', sampleNamesArr[2]);
              }
            });

            isFirstSheet = false; // 将标记设置为false，以确保只处理第一张工作表
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
