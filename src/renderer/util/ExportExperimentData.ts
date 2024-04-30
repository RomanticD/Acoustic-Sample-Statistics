import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { FormattedExperimentData } from '../model/ExperimentDataModel';

/**
 * 将数据导出到 Excel 文件中
 *
 * @param {string} worksheetName - Excel 工作表名称
 * @param {any[]} columns - 列配置，包含每列的标题、宽度等信息
 * @param {any[]} data - 要导出的数据，每个元素为一行数据
 * @param {string} filename - 导出的 Excel 文件名称
 */
export function exportToExcel(
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

/**
 * This function exports experiment data to an Excel file.
 *
 * @param {FormattedExperimentData} data - The experiment data to be exported.
 */
export default function exportExperimentDataToExcel(
  data: FormattedExperimentData,
) {
  const rows: any[] = [];
  const columnInfo: {
    header: string;
    key: string;
    width?: number;
    style?: any;
  }[] = [];
  columnInfo.push({
    header: '被试ID / 样本名称',
    key: 'Id',
    width: 15,
    style: {
      alignment: {
        vertical: 'middle',
        horizontal: 'left',
        shrinkToFit: true,
      },
    },
  });

  data.experiment.samples.forEach((sample) => {
    columnInfo.push({
      header: sample.name,
      key: sample.id.toString(),
      width: 10,
      style: {
        numFmt: '0.000',
        alignment: {
          vertical: 'middle',
          horizontal: 'center',
          shrinkToFit: true,
        },
      },
    });
  });

  // 获取所有可能的被试 ID, 即包括被剔除前的ID
  const maxId = Math.max(
    ...data.evaluations.map((sample) => sample.participant.id),
  );
  const allParticipantIds: number[] = Array.from(
    { length: maxId },
    (_, index) => index + 1,
  );

  // 创建包含所有可能被试 ID 的行
  allParticipantIds.forEach((participantId) => {
    const rowData: { [key: string]: number | undefined } = {
      Id: participantId,
    };

    data.experiment.samples.forEach((sample) => {
      rowData[sample.id.toString()] = undefined; // 初始化每个样本的评分为 undefined
    });

    rows.push(rowData);
  });

  // 填充评分数据
  data.evaluations.forEach((evaluation) => {
    const currentParticipantId = evaluation.participant.id;
    const rowData = rows.find((row) => row.Id === currentParticipantId); // 找到对应的行

    if (rowData) {
      evaluation.currentParticipantEvaluations.forEach((item) => {
        rowData[item.sample.id.toString()] = item.details[0]?.rating;
      });
    }
  });

  exportToExcel(
    '校准后实验数据',
    columnInfo,
    rows,
    'calibrated_experiment_data.xlsx',
  );
}
