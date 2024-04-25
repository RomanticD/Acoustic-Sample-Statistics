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
  getFunctionExpressions,
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
let everyParticipantFitFunctionExpression: {
  fn: string;
  participantId: number;
}[] = [];

export default function ImportExcelPage() {
  const [hasData, setHasData] = React.useState(false);
  const [disableZoom, setDisableZoom] = useState(false);
  const [an_acousticParameter, setA_acousticParameter] = useState(0);
  const [bn_acousticParameter, setB_acousticParameter] = useState(0);
  const [experimentFunctionExpression, setExperimentFunctionExpression] =
    useState('y = 0 * x + 0');
  const [points, setPoints] = React.useState<Point[]>([]);
  const [
    acousticParameterFunctionExpression,
    setAcousticParameterFunctionExpression,
  ] = useState('');
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
    console.log(getFunctionExpressions(dataAfterCalibrating));

    everyParticipantFitFunctionExpression =
      getFunctionExpressions(dataAfterCalibrating);

    setExperimentFunctionExpression(
      getFunctionExpressions(dataAfterCalibrating)[0].fn,
    );
    console.log(experimentFunctionExpression);

    const dataPoints: Point[] = [
      [1, 2],
      [2, 3],
      [3, 5],
      [4, 7],
      [5, 7.5],
      [9, 8],
    ];

    const [a, b] = logisticFit(dataPoints, 1000, 0.01);

    setPoints(dataPoints);
    setAcousticParameterFunctionExpression(generateLogisticExpression(a, b));
    setA_acousticParameter(a);
    setB_acousticParameter(b);
  }, [dataList]);

  const acousticParameter = [
    {
      fn: `y = 10 / (1 + exp(-(${an_acousticParameter} * x + ${bn_acousticParameter})))`,
    },
    {
      points,
      fnType: 'points',
      graphType: 'scatter',
    },
  ];

  const acousticParameterOptions = {
    target: '#acoustic-parameter-graph-wrapper',
    title: `${acousticParameterFunctionExpression}`,
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

  // const options = {
  //   target: '#experiment-fit-graph-wrapper',
  //   title: `拟合数据`,
  //   yAxis: {
  //     label: 'Y',
  //     domain: [-10, 14],
  //   },
  //   xAxis: {
  //     label: 'X',
  //   },
  //   grid: false,
  //   disableZoom,
  // };
  //
  // const data = [
  //   {
  //     fn: `${experimentFunctionExpression}`,
  //   },
  // ];

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
        <InfoDisplay
          data={hasData ? everyParticipantFitFunctionExpression : ''}
          count={dataList.length}
        />
        <div className="graph-and-label-wrapper">
          <div className="label-and-button">
            <h3 className="title-label">感知烦恼度预测模型</h3>
            <button
              type="button"
              onClick={enableZoom}
              className="button-enable-zoom"
            >
              {disableZoom ? '解锁图像' : '恢复默认'}
            </button>
          </div>
          <div id="acoustic-parameter-graph-wrapper" className="graph-wrapper">
            <Graph
              data={acousticParameter}
              options={acousticParameterOptions}
            />
          </div>
          {/* {hasData && ( */}
          {/*  <div id="experiment-fit-graph-wrapper" className="graph-wrapper"> */}
          {/*    <Graph data={data} options={options} /> */}
          {/*  </div> */}
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
