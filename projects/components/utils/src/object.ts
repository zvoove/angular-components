export function objectToKeyValueArray(errors: { [key: string]: any }): { key: string; value: any }[] {
  const errorList = [];
  for (const key in errors) {
    if (!errors.hasOwnProperty(key)) {
      continue;
    }

    errorList.push({
      key: key,
      value: errors[key],
    });
  }

  return errorList;
}
