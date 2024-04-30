import exportExperimentDataToExcel from '../../util/ExportExperimentData';
import { FormattedExperimentData } from '../../model/ExperimentDataModel';
import './ExportExperimentDataButton.css';

export default function ExportCalibratedDataButton({
  dataToExport,
}: {
  dataToExport: FormattedExperimentData | undefined;
}) {
  const handleClick = () => {
    if (dataToExport) {
      exportExperimentDataToExcel(dataToExport);
    }
  };

  return (
    <div className="export-button-panel">
      <h1 className="export-p">导出校准后实验数据</h1>
      <button
        className="export-calibrated-data-button"
        type="button"
        onClick={handleClick}
        disabled={!dataToExport}
      >
        导出
      </button>
    </div>
  );
}
