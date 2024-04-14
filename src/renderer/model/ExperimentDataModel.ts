export interface Sample {
  id: number; // 声样本的唯一标识符
  name: string;
  type?: 'reference' | 'test'; // 区分参考声样本和待评价声样本
}

export interface Participant {
  id: number; // 受试者的唯一标识符
  name?: string; // 受试者姓名
  age?: number; // 受试者年龄
  gender?: 'male' | 'female'; // 受试者性别
}

export interface Evaluation {
  participant: Participant; // 受试者信息
  evaluations: {
    sampleName: string; // 被评价的声样本
    rating?: number; // 评分,词语量表为1-5（一点没有-非常严重），数字量表为0-10（一点不烦恼-极度烦恼）
    numberOfEvaluations: 1 | 2 | 3; // 当前评价的次数，每个样本会评价三次
  }[];
}

export interface Experiment {
  scale: 'word' | 'digital'; // 词语量表或数字量表
  samples: Sample[]; // 实验中的声样本数组
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ExperimentData {
  experiment: Experiment;
  evaluations: Evaluation[];
}

export function getSampleByName(
  experimentData: ExperimentData,
  sampleName: String,
): Sample | undefined {
  return experimentData.experiment.samples.find(
    (sample) => sample.name === sampleName,
  );
}

export interface NoiseSensitivityScale {
  participant: Participant;
  evaluations: {
    questionId: number;
    sensitiveValue?: number;
  };
}

export interface EvaluationDetail {
  rating?: number;
  numberOfEvaluations: 1 | 2 | 3;
}

export interface EvaluationBySingleParticipant {
  sample: Sample;
  detail: EvaluationDetail[];
}

export interface SamplesEvaluationByParticipant {
  participant: Participant;
  evaluations: EvaluationBySingleParticipant[];
}
