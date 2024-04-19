import React, { useState } from 'react';
import './FileInputUtil.css';
import Excel from 'exceljs';
import {
  acousticParameterTableData,
  Evaluation,
  NoiseSensitivityScaleData,
  SingleSampleAndItsParameters,
} from '../model/ExperimentDataModel';
import {
  handleDigitalAndNumberScaleDataToJson,
  handleSampleNames,
  reformatExperimentData,
  getExperimentData,
  getFormattedExperimentData,
  filterInvalidExperimentData,
} from '../util/WordAndDigitalScaleDataHandler';
import getScale from '../util/Helper';
import {
  getFormattedNoiseSensitivityScaleData,
  getNoiseSensitivityScaleData,
  handleNoiseSensitivityScaleData,
} from '../util/NoiseSensitivityScaleDataHandler';
import handleAcousticParameterData from '../util/AcousticParameterDataHandler';

let scale = '';

function ExcelToJsonConverter() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [fileName, setFileName] = useState('');

  // @ts-ignore
  const handleFileChange = (e) => {
    const keywords = ['数字', '词语', '敏感性', '声学参量'];
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const fileName = selectedFile.name;

      if (keywords.some((keyword) => fileName.includes(keyword))) {
        setFile(selectedFile);
        setFileName(fileName);
        scale = getScale(fileName);
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
      const digitalAndWordScaleEvaluationData: Evaluation[] = [];
      const sampleNamesArr: string[] = [];
      const noiseSensitivityScaleEvaluationData: NoiseSensitivityScaleData[] =
        [];
      const acousticParameterData: SingleSampleAndItsParameters[] = [];

      try {
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(data);
        let isFirstSheet = true; // 标记是否为第一张工作表

        workbook.eachSheet((worksheet) => {
          if (isFirstSheet) {
            // 只处理第一张工作表
            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber !== 1) {
                if (scale === 'digital' || scale === 'word') {
                  handleDigitalAndNumberScaleDataToJson(
                    row,
                    sampleNamesArr,
                    digitalAndWordScaleEvaluationData,
                  );
                } else if (scale === 'noise sensitivity') {
                  handleNoiseSensitivityScaleData(
                    row,
                    noiseSensitivityScaleEvaluationData,
                  );
                } else if (scale === 'acoustic parameter') {
                  handleAcousticParameterData(row, acousticParameterData);
                }
              } else {
                handleSampleNames(row, sampleNamesArr);
              }
            });
            isFirstSheet = false;
          }
        });

        console.log(sampleNamesArr);

        if (scale === 'digital' || scale === 'word') {
          const experimentData = getExperimentData(
            sampleNamesArr,
            digitalAndWordScaleEvaluationData,
            scale,
          );

          const formattedExperimentData = getFormattedExperimentData(
            sampleNamesArr,
            reformatExperimentData(experimentData),
            scale,
          );

          const validExperimentData = filterInvalidExperimentData(
            formattedExperimentData,
          );

          // setJsonData(JSON.stringify(formattedExperimentData, null, 2));
          setJsonData(JSON.stringify(validExperimentData, null, 2));

          console.log(validExperimentData);
        } else if (scale === 'noise sensitivity') {
          const sensitivityScaleData = getNoiseSensitivityScaleData(
            sampleNamesArr,
            noiseSensitivityScaleEvaluationData,
          );

          const formattedNoiseSensitivityScaleData =
            getFormattedNoiseSensitivityScaleData(sensitivityScaleData);

          console.log(formattedNoiseSensitivityScaleData);

          setJsonData(
            JSON.stringify(formattedNoiseSensitivityScaleData, null, 2),
          );
        } else if (scale === 'acoustic parameter') {
          // 显示处理后的声学参量表
        }

        isFirstSheet = true;
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
