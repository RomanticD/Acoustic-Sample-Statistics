import React, { useEffect } from 'react';
import FileInputUtil from './FileInputUtil';
import './ImportExcelPage.css';
import TopNavbar from './NavBar';
import {
  AcousticParameterTableData,
  FormattedExperimentData,
  FormattedNoiseSensitivityScaleData,
} from '../model/ExperimentDataModel';
import separateList, {
  calibrateExperimentData,
  getAverageNoiseAnnoyanceForSamples,
} from '../util/DataListHandler';
import InfoDisplay from './InfoDisplay';

let sampleWithItsAveragedAnnoyance: { [sampleName: string]: number } = {};
export default function ImportExcelPage() {
  const [dataList, setDataList] = React.useState<
    Array<
      | AcousticParameterTableData
      | FormattedNoiseSensitivityScaleData
      | FormattedExperimentData
    >
  >([]);

  const [hasData, setHasData] = React.useState(false);

  const handleReceivedData = (
    data:
      | AcousticParameterTableData
      | FormattedNoiseSensitivityScaleData
      | FormattedExperimentData
      | null,
  ) => {
    if (data) {
      // 检查数据是否已存在于 dataList
      const dataExists = dataList.some((item) => item === data);

      // 如果数据不存在于 dataList，则将其添加到 dataList
      if (!dataExists) {
        setDataList((prevDataList) => {
          // 取出 dataList 的最后一项
          const lastItem = prevDataList.slice(-1);

          // 将新数据与最后一项合并
          return [...lastItem, data];
        });
      }
    }

    if (dataList.length === 2) {
      setHasData(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { acousticParameterTableData, experimentData } =
      separateList(dataList) ?? {};
    const dataAfterCalibrating = calibrateExperimentData(experimentData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sampleWithItsAveragedAnnoyance =
      getAverageNoiseAnnoyanceForSamples(dataAfterCalibrating);
  }, [dataList]);

  return (
    <div>
      <TopNavbar />
      <div className="select-excel-page">
        <div />
        <FileInputUtil
          description="被试者数据"
          dataObtained={handleReceivedData}
        />
        <FileInputUtil
          description="声学参量表"
          dataObtained={handleReceivedData}
        />
        <InfoDisplay
          data={hasData ? sampleWithItsAveragedAnnoyance : ''}
          count={dataList.length}
        />
      </div>
    </div>
  );
}
