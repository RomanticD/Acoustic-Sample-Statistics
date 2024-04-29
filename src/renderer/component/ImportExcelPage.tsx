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
import { calculateRange } from '../util/Mapper';
import jsonDataSample from '../util/ExportDataSample.json';
import exportExperimentDataToExcel from '../util/ExportExperimentData';

let sampleWithItsAveragedAnnoyance: { [sampleName: string]: number } = {};
let everyParticipantFitFunctionExpression: {
  fn: string;
  participantId: number;
}[] = [];
let mergedAcousticParameterData: AcousticParameterTableData | undefined;

export default function ImportExcelPage() {
  const [hasDataCollected, setHasDataCollected] = React.useState(false);
  const [disableZoom, setDisableZoom] = useState(false);
  // eslint-disable-next-line camelcase
  const [an_acousticParameter, setA_acousticParameter] = useState(0);
  // eslint-disable-next-line camelcase
  const [bn_acousticParameter, setB_acousticParameter] = useState(0);
  // eslint-disable-next-line camelcase
  const [cn_acousticParameter, setC_acousticParameter] = useState(0);
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState('');

  // 处理选择框变化时的函数
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // 将所选的值转换为数字
    const index = event.target.selectedIndex;
    const { value } = event.target;
    // 更新状态
    setSelectedIndex(index);
    setSelectedValue(value);
  };

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

    mergedAcousticParameterData = acousticParameterDataAfterMerging(
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
      dataPoints = paraAndPointsArr[selectedIndex].points;
      setPoints(dataPoints);
    }

    // const dataPoints: Point[] = paraAndPointsArr[0].points;

    const [a, b, c] = logisticFit(dataPoints, 13, 0.01);

    setPoints(dataPoints);
    setA_acousticParameter(a);
    setB_acousticParameter(b);
    setC_acousticParameter(c);
  }, [dataList, selectedIndex]);

  const acousticParameter = [
    {
      // eslint-disable-next-line camelcase
      fn: `y = 10 / (1 + exp(-(${an_acousticParameter} * ( x - ${Math.abs(
        cn_acousticParameter,
        // eslint-disable-next-line camelcase
      )} ) + ${bn_acousticParameter})))`,
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
      domain: calculateRange(points).yRange,
    },
    xAxis: {
      label: selectedValue,
      domain: calculateRange(points).xRange,
    },
    grid: true,
    disableZoom,
  };

  return (
    <div>
      <TopNavbar />
      <button
        type="button"
        // @ts-ignore
        onClick={() => exportExperimentDataToExcel(jsonDataSample)}
      >
        Export
      </button>
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
                        )}(x - ${Math.abs(cn_acousticParameter).toFixed(
                          3,
                        )}) - ${Math.abs(
                          // eslint-disable-next-line camelcase
                          Number(bn_acousticParameter.toFixed(3)),
                        )})}}$`
                      : // eslint-disable-next-line camelcase
                        `$y = \\frac{10}{1 + e^{- (${an_acousticParameter.toFixed(
                          3,
                          // eslint-disable-next-line camelcase
                        )}(x - ${Math.abs(
                          cn_acousticParameter,
                          // eslint-disable-next-line camelcase
                        ).toFixed(3)}) + ${bn_acousticParameter.toFixed(
                          3,
                        )})}}$`}
                  </Latex>
                </div>
              </div>
              <div className="button-group-graph">
                <button
                  type="button"
                  onClick={enableZoom}
                  className="button-enable-zoom"
                >
                  {disableZoom ? '解锁图像' : '恢复默认'}
                </button>
                <select
                  value={selectedValue}
                  onChange={handleChange}
                  className="select-parameter-name"
                >
                  {mergedAcousticParameterData?.allSamplesWithAcousticalParameterInfo[0].parametersInfo.map(
                    (info) => (
                      <option
                        key={info.parameterName}
                        value={info.parameterName}
                      >
                        {info.parameterName}
                      </option>
                    ),
                  )}
                </select>
              </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
