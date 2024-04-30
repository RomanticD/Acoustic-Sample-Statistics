import React, { useEffect, useState } from 'react';
import './FileInputUtil.css';
import Excel from 'exceljs';
import {
  AcousticParameterTableData,
  Evaluation,
  FormattedExperimentData,
  FormattedNoiseSensitivityScaleData,
  NoiseSensitivityScaleData,
} from '../../model/ExperimentDataModel';
import {
  handleDigitalAndNumberScaleDataToJson,
  handleSampleNames,
  reformatExperimentData,
  getExperimentData,
  getFormattedExperimentData,
  filterInvalidExperimentData,
} from '../../util/WordAndDigitalScaleDataHandler';
import getScale from '../../util/Mapper';
import {
  getFormattedNoiseSensitivityScaleData,
  getNoiseSensitivityScaleData,
  handleNoiseSensitivityScaleData,
} from '../../util/NoiseSensitivityScaleDataHandler';
import handleAcousticParameterData, {
  getFormattedAcousticParameterData,
} from '../../util/AcousticParameterDataHandler';

function ExcelToJsonConverter({
  description,
  dataObtained,
}: {
  description: string;
  dataObtained: (
    data:
      | AcousticParameterTableData
      | FormattedNoiseSensitivityScaleData
      | FormattedExperimentData
      | null,
  ) => void;
}) {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState<
    | AcousticParameterTableData
    | FormattedNoiseSensitivityScaleData
    | FormattedExperimentData
    | null
  >(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [displayData, setDisplayData] = useState('');
  const [fileName, setFileName] = useState('');
  const [scale, setScale] = useState('');

  useEffect(() => {
    if (jsonData !== null) {
      dataObtained(jsonData);
    }
  }, [dataObtained, jsonData]);

  // @ts-ignore
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      window.alert('文件选择失效');
      return;
    }

    const selectedFileName = selectedFile.name;

    const checkFileName = (keywords: string[]) => {
      return keywords.some((keyword) => selectedFileName.includes(keyword));
    };

    const showErrorAndReset = (message: string) => {
      window.alert(message);
      e.target.value = null;
      setFileName(`选择文件 ${description}`);
    };

    const handleDescription = (keywords: string[]) => {
      if (!checkFileName(keywords)) {
        showErrorAndReset('请选择指定类型文件');
        return false;
      }
      return true;
    };

    switch (description) {
      case '被试者数据':
        if (!handleDescription(['数字', '词语'])) return;
        break;
      case '声学参量表':
        if (!handleDescription(['声学参量表'])) return;
        break;
      default:
        showErrorAndReset('请重试');
        return;
    }

    setFile(selectedFile);
    setFileName(selectedFileName);
    setScale(getScale(selectedFileName));
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
      const acousticParameterData: any[] = [];

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
                  handleAcousticParameterData(
                    row,
                    acousticParameterData,
                    sampleNamesArr,
                  );
                }
              } else {
                handleSampleNames(row, sampleNamesArr);
              }
            });
            isFirstSheet = false;
          }
        });

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

          setDisplayData(JSON.stringify(validExperimentData, null, 2));

          setJsonData(validExperimentData);
        } else if (scale === 'noise sensitivity') {
          const sensitivityScaleData = getNoiseSensitivityScaleData(
            sampleNamesArr,
            noiseSensitivityScaleEvaluationData,
          );

          const formattedNoiseSensitivityScaleData =
            getFormattedNoiseSensitivityScaleData(sensitivityScaleData);

          setDisplayData(
            JSON.stringify(formattedNoiseSensitivityScaleData, null, 2),
          );

          setJsonData(formattedNoiseSensitivityScaleData);
        } else if (scale === 'acoustic parameter') {
          setDisplayData(
            JSON.stringify(
              getFormattedAcousticParameterData(acousticParameterData),
              null,
              2,
            ),
          );

          setJsonData(getFormattedAcousticParameterData(acousticParameterData));
        }
        dataObtained(jsonData);
        isFirstSheet = true;
      } catch (error) {
        // @ts-ignore
        window.alert(`Error:${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="file-input-container">
      <label htmlFor={`file-input-${description}`} className="file-input-label">
        <span className="upload-icon">📁</span>{' '}
        {fileName || `选择文件 ${description}`}
      </label>
      <input
        id={`file-input-${description}`}
        type="file"
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        className="file-input"
      />
      <button type="button" onClick={handleConvert} className="button">
        确定
      </button>
      {/* <pre className="json-data">{displayData}</pre> */}
    </div>
  );
}

export default ExcelToJsonConverter;
