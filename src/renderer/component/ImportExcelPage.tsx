import React, { useEffect, useState } from 'react';
import FileInputUtil from './FileInputUtil';
import './ImportExcelPage.css';
import TopNavbar from './NavBar';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  AcousticParameterTableData,
  FormattedExperimentData,
  FormattedNoiseSensitivityScaleData,
} from '../model/ExperimentDataModel';

export default function ImportExcelPage() {
  const [receivedData, setReceivedData] = useState<
    | AcousticParameterTableData
    | FormattedNoiseSensitivityScaleData
    | FormattedExperimentData
    | null
  >(null);
  const [dataList, setDataList] = React.useState<
    Array<
      | AcousticParameterTableData
      | FormattedNoiseSensitivityScaleData
      | FormattedExperimentData
    >
  >([]);

  const handleReceivedData = (
    data:
      | AcousticParameterTableData
      | FormattedNoiseSensitivityScaleData
      | FormattedExperimentData
      | null,
  ) => {
    if (data) {
      // 检查数据是否已存在于 dataList
      const dataExists = dataList.some(
        (item) => JSON.stringify(item) === JSON.stringify(data),
      );

      // 如果数据不存在于 dataList，则将其添加到 dataList
      if (!dataExists) {
        setDataList((prevDataList) => {
          // 取出 dataList 的最后两项
          const lastTwoItems = prevDataList.slice(-1);

          // 将新数据与最后两项合并
          return [...lastTwoItems, data];
        });
      }
    }
    // @ts-ignore
    setReceivedData(data);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dataSample = [
    [50, Math.log10(1)],
    [60, Math.log10(2)],
    [70, Math.log10(2)],
    [80, Math.log10(4)],
    [90, Math.log10(8)],
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dataTest = [
    [30, -0.432],
    [35, -0.319],
    [40, -0.144],
    [45, 0.158],
    [50, 0.281],
    [55, 0.344],
    [60, 0.394],
    [65, 0.525],
    [70, 0.599],
    [75, 0.741],
    [80, 0.821],
    [85, 0.906],
    [90, 0.96],
    [95, 0.991],
  ];

  const testDisplayData = JSON.parse(JSON.stringify(receivedData));
  useEffect(() => {
    console.log(testDisplayData);
    console.log(dataList);
  }, [dataList, receivedData, testDisplayData]);

  return (
    <div className="select-excel-page">
      <TopNavbar />
      <FileInputUtil
        description="被试者数据"
        dataObtained={handleReceivedData}
      />
      <FileInputUtil
        description="声学参量表"
        dataObtained={handleReceivedData}
      />
      {/* <InfoDisplay formData={JSON.stringify(receivedData)} /> */}
    </div>
  );
}
