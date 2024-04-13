export default function getWorryLevel(word: string | number): number | null {
  // 如果 word 是一个 number 类型，则直接返回
  if (typeof word === 'number') {
    return word;
  }

  const wordMapping: { [key: string]: number } = {
    一点没有: 0,
    轻微: 2.5,
    一般: 5,
    严重: 7.5,
    非常严重: 10,
  };

  // 将输入字符串转换为小写，以便与映射中的键进行比较
  const lowercaseWord = word.trim().toLowerCase();

  // 检查输入的词语是否存在于映射中
  if (lowercaseWord in wordMapping) {
    return wordMapping[lowercaseWord];
  }
  // 如果输入的词语不在映射中，则返回 null 或其他默认值
  return null;
}
