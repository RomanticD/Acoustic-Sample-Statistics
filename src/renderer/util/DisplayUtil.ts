// eslint-disable-next-line import/prefer-default-export
export function addYearsOldToAgeProperties(data: { [key: string]: string }): {
  [key: string]: string;
} {
  const modifiedData: { [key: string]: string } = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const key in data) {
    if (key.startsWith('age')) {
      modifiedData[key] = `${data[key]} years old`;
    } else {
      modifiedData[key] = data[key];
    }
  }

  return modifiedData;
}
