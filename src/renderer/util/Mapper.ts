import { ExperimentData, Sample } from '../model/ExperimentDataModel';

/**
 * 根据文件名获取相应的音频标度。
 *
 * @param fileName 要解析的文件名。
 * @returns 返回与文件名匹配的音频标度，如果未找到匹配则返回空字符串。
 */
export default function getScale(fileName: string): string {
  const mappings: { [key: string]: string } = {
    数字: 'digital',
    词语: 'word',
    敏感性: 'noise sensitivity',
    声学参量: 'acoustic parameter',
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const key in mappings) {
    if (fileName.includes(key)) {
      return mappings[key];
    }
  }

  return '';
}

/**
 * 根据输入的词语或数字返回相应的烦恼度
 *
 * @param value 输入的词语或数字
 * @returns 返回与输入匹配的烦恼度数值，或者返回null（如果输入无法识别）
 */
export function getSoundAnnoyanceValue(value?: string | number): number | null {
  if (typeof value === 'number') {
    return value;
  }

  const wordMapping: { [key: string]: number } = {
    一点没有: 0,
    轻微: 2.5,
    一般: 5,
    严重: 7.5,
    非常严重: 10,
  };

  // @ts-ignore
  const lowercaseWord = value.trim().toLowerCase();

  if (lowercaseWord in wordMapping) {
    return wordMapping[lowercaseWord];
  }

  return null;
}

/**
 * 根据样本名称从实验数据中获取样本。
 *
 * @param experimentData 实验数据对象。
 * @param sampleName 要查找的样本名称。
 * @returns 返回找到的样本对象，如果未找到则返回 undefined。
 */
export function getSampleByName(
  experimentData: ExperimentData,
  sampleName: String,
): Sample | undefined {
  return experimentData.experiment.samples.find(
    (sample) => sample.name === sampleName,
  );
}
