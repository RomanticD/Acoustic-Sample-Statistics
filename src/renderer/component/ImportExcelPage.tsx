import React, { useState } from 'react';
import FileInputUtil from './FileInputUtil';
import './ImportExcelPage.css';
import TopNavbar from './NavBar';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import InfoDisplay from './InfoDisplay';
import { FormattedExperimentData } from '../model/ExperimentDataModel';

export default function ImportExcelPage() {
  const [receivedData, setReceivedData] =
    useState<FormattedExperimentData | null>(null);

  // @ts-ignore
  const handleReceivedData = (data: FormattedExperimentData | null) => {
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
  console.log(testDisplayData);

  return (
    <div className="select-excel-page">
      <TopNavbar />
      <FileInputUtil description="1" dataObtained={handleReceivedData} />
      <FileInputUtil description="2" dataObtained={handleReceivedData} />
      {/* <InfoDisplay formData={JSON.stringify(receivedData)} /> */}
    </div>
  );
}
