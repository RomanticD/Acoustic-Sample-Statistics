import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FormattedExperimentData } from '../model/ExperimentDataModel';

function exportToExcel(
  worksheetName: string,
  columns: any[],
  data: any[],
  filename: string,
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetName);

  worksheet.columns = columns;

  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // eslint-disable-next-line promise/catch-or-return,promise/always-return
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
  });
}

export default function exportExperimentDataToExcel(
  data: FormattedExperimentData,
) {
  const rows: any[] = [];
  const columnNames: { header: string; key: string; width: number }[] = [];
  columnNames.push({ header: '被试ID', key: 'Id', width: 20 });

  columnNames.concat(
    data.experiment.samples.map((item) => {
      return { header: item.name, key: item.id.toString(), width: 3 };
    }),
  );

  data.experiment.samples.forEach((sample) => {
    columnNames.push({
      header: sample.name,
      key: sample.id.toString(),
      width: 15,
    });
  });

  data.evaluations.forEach((evaluation) => {
    const currentParticipantId = evaluation.participant.id;
    const rowData: { [key: string]: number | undefined } = {
      Id: currentParticipantId,
    };

    evaluation.currentParticipantEvaluations.forEach((item) => {
      rowData[item.sample.id.toString()] = item.details[0]?.rating;
    });

    rows.push(rowData);
  });

  exportToExcel(
    '实验数据',
    columnNames,
    rows,
    'calibrated_experiment_data_.xlsx',
  );
}
