export interface Sample {
  id: number; // 声样本的唯一标识符
  name: String;
  type: 'reference' | 'test'; // 区分参考声样本和待评价声样本
}

export interface Experiment {
  samples: Sample[]; // 实验中的声样本数组
}

export interface Participant {
  id: number; // 受试者的唯一标识符
  name: string; // 受试者姓名
  age: number; // 受试者年龄
  gender: 'male' | 'female'; // 受试者性别
}

export interface Evaluation {
  participant: Participant; // 受试者信息
  evaluations: {
    sampleId: number; // 被评价的声样本的唯一标识符
    rating: number; // 评分
    repeated: 1 | 2 | 3; // 当前播放的次数，每个样本会播放三次
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ExperimentData {
  experiment: Experiment;
  evaluations: Evaluation[];
}

export function findSampleById(
  experimentData: ExperimentData,
  sampleId: number,
): Sample | undefined {
  return experimentData.experiment.samples.find(
    (sample) => sample.id === sampleId,
  );
}
