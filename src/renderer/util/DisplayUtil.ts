// eslint-disable-next-line import/prefer-default-export
export function reformatDataToDisplay(data: { [key: string]: string }): {
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

export function removeFormDataThatNotShown(
  fieldCount: number,
  data: { [key: string]: string },
): {
  [key: string]: string;
} {
  const filteredData = {};
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < fieldCount; i++) {
    let shouldKeep = false;
    if (data[`firstName_${i}`] !== null) {
      shouldKeep = true;
    } else if (data[`lastName_${i}`] !== null) {
      shouldKeep = true;
    } else if (data[`age_${i}`] !== null) {
      shouldKeep = true;
    }

    if (shouldKeep) {
      if (data[`firstName_${i}`]) {
        // @ts-ignore
        filteredData[`firstName_${i}`] = data[`firstName_${i}`];
      }
      if (data[`lastName_${i}`]) {
        // @ts-ignore
        filteredData[`lastName_${i}`] = data[`lastName_${i}`];
      }
      if (data[`age_${i}`]) {
        // @ts-ignore
        filteredData[`age_${i}`] = data[`age_${i}`];
      }
    }
  }
  return filteredData;
}
