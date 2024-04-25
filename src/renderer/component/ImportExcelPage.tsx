import React, { useEffect, useState } from 'react';
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
import { acousticParameterDataAfterMerging } from '../util/AcousticParameterDataHandler';
import Graph from './FunctionPlot';
import {
  generateLogisticExpression,
  logisticFit,
  Point,
} from '../util/Algorithm';

let sampleWithItsAveragedAnnoyance: { [sampleName: string]: number } = {};

export default function ImportExcelPage() {
  const [hasData, setHasData] = React.useState(false);
  const [disableZoom, setDisableZoom] = useState(false);
  const [an, setA] = useState(1);
  const [bn, setB] = useState(2);
  const [points, setPoints] = React.useState<Point[]>([]);
  const [functionExpression, setFunctionExpression] = useState('');
  const [dataList, setDataList] = React.useState<
    Array<
      | AcousticParameterTableData
      | FormattedNoiseSensitivityScaleData
      | FormattedExperimentData
    >
  >([]);

  function enableZoom() {
    setDisableZoom(!disableZoom);
  }

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
    // console.log(dataList);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { acousticParameterTableData, experimentData } =
      separateList(dataList) ?? {};

    const dataAfterCalibrating = calibrateExperimentData(experimentData);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sampleWithItsAveragedAnnoyance =
      getAverageNoiseAnnoyanceForSamples(dataAfterCalibrating);

    const mergedAcousticParameterData = acousticParameterDataAfterMerging(
      acousticParameterTableData,
    );
    console.log(mergedAcousticParameterData);

    const dataPoints: Point[] = [
      [1, 2],
      [2, 3],
      [3, 5],
      [8, 9],
      [7, 6],
      [12, 89],
      // ... 更多数据点
    ];

    const [a, b] = logisticFit(dataPoints, 1000, 0.01);

    setPoints(dataPoints);
    setFunctionExpression(generateLogisticExpression(a, b));
    setA(a);
    setB(b);
  }, [dataList]);

  const data = [
    {
      fn: `y = 10 / (1 + exp(-(${an} * x + ${bn})))`,
    },
    {
      points,
      fnType: 'points',
      graphType: 'scatter',
    },
  ];

  const options = {
    target: '#graph-wrapper',
    title: `感知烦恼度预测模型 ${functionExpression}`,
    yAxis: {
      label: 'Am',
      domain: [-1, 14],
    },
    xAxis: {
      label: 'L',
    },
    grid: false,
    disableZoom,
  };

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
        <div id="graph-wrapper" className="graph-wrapper">
          <button
            type="button"
            onClick={enableZoom}
            className="button-enable-zoom"
          >
            {disableZoom ? '解锁图像' : '锁定图像'}
          </button>
          <Graph data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
