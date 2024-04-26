import React, { useEffect, useState } from 'react';
// @ts-ignore
import Latex from 'react-latex';
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
import {
  acousticParameterDataAfterMerging,
  getDataPointsForAllAcousticParameters,
} from '../util/AcousticParameterDataHandler';
import Graph from './FunctionPlot';
import { logisticFit, Point } from '../util/Algorithm';

let sampleWithItsAveragedAnnoyance: { [sampleName: string]: number } = {};
let everyParticipantFitFunctionExpression: {
  fn: string;
  participantId: number;
}[] = [];

export default function ImportExcelPage() {
  const [hasDataCollected, setHasDataCollected] = React.useState(false);
  const [disableZoom, setDisableZoom] = useState(false);
  // eslint-disable-next-line camelcase
  const [an_acousticParameter, setA_acousticParameter] = useState(0);
  // eslint-disable-next-line camelcase
  const [bn_acousticParameter, setB_acousticParameter] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [experimentFunctionExpression, setExperimentFunctionExpression] =
    useState<string[]>([]);
  const [points, setPoints] = React.useState<Point[]>([]);
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
      const dataExists = dataList.some(
        (item) => item.experiment.scale === data.experiment.scale,
      );

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
      setHasDataCollected(true);
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

    const paraAndPointsArr = getDataPointsForAllAcousticParameters(
      sampleWithItsAveragedAnnoyance,
      mergedAcousticParameterData,
    );

    let dataPoints: Point[] = [[0, 1]];

    if (paraAndPointsArr.length !== 0) {
      dataPoints = paraAndPointsArr[0].points;
      setPoints(dataPoints);
    }

    // const dataPoints: Point[] = paraAndPointsArr[0].points;

    const [a, b] = logisticFit(dataPoints, 1000, 0.01);
    console.log(a);
    console.log(b);

    setPoints(dataPoints);
    setA_acousticParameter(a);
    setB_acousticParameter(b);
  }, [dataList]);

  const acousticParameter = [
    {
      // eslint-disable-next-line camelcase
      fn: `y = 10 / (1 + exp(-(${an_acousticParameter} * ( x - 0 ) + ${bn_acousticParameter})))`,
    },
    {
      points,
      fnType: 'points',
      graphType: 'scatter',
    },
  ];

  const acousticParameterOptions = {
    target: '#acoustic-parameter-graph-wrapper',
    yAxis: {
      label: 'Am',
      domain: [-1, 14],
    },
    xAxis: {
      label: 'L',
    },
    grid: true,
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
          data={hasDataCollected ? sampleWithItsAveragedAnnoyance : ''}
          count={dataList.length}
        />
        {hasDataCollected && (
          <InfoDisplay
            data={hasDataCollected ? everyParticipantFitFunctionExpression : ''}
            count={dataList.length}
          />
        )}
        {hasDataCollected && (
          <div className="graph-and-label-wrapper">
            <div className="label-and-button">
              <div className="div-for-label">
                <h3 className="title-label">感知烦恼度预测模型</h3>
                <div className="Latex-expression">
                  {/* eslint-disable-next-line camelcase */}
                  <Latex>
                    {/* eslint-disable-next-line camelcase */}
                    {bn_acousticParameter < 0
                      ? // eslint-disable-next-line camelcase
                        `$y = \\frac{10}{1 + e^{- (${an_acousticParameter.toFixed(
                          3,
                          // eslint-disable-next-line camelcase
                        )}x - ${Math.abs(
                          // eslint-disable-next-line camelcase
                          Number(bn_acousticParameter.toFixed(3)),
                        )})}}$`
                      : // eslint-disable-next-line camelcase
                        `$y = \\frac{10}{1 + e^{- (${an_acousticParameter.toFixed(
                          3,
                          // eslint-disable-next-line camelcase
                        )}x + ${bn_acousticParameter.toFixed(3)})}}$`}
                  </Latex>
                </div>
              </div>
              <button
                type="button"
                onClick={enableZoom}
                className="button-enable-zoom"
              >
                {disableZoom ? '解锁图像' : '恢复默认'}
              </button>
            </div>
            <div
              id="acoustic-parameter-graph-wrapper"
              className="graph-wrapper"
            >
              <Graph
                data={acousticParameter}
                options={acousticParameterOptions}
              />
            </div>
            {/* {hasDataCollected && ( */}
            {/*  <div id="experiment-fit-graph-wrapper" className="graph-wrapper"> */}
            {/*    <Graph data={data} options={options} /> */}
            {/*  </div> */}
            {/* )} */}
          </div>
        )}
      </div>
    </div>
  );
}
