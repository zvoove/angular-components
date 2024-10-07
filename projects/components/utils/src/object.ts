export function objectToKeyValueArray(errors: Record<string, unknown>): { key: string; value: unknown }[] {
  const errorList = [];
  for (const key in errors) {
    if (!Object.prototype.hasOwnProperty.call(errors, key)) {
      continue;
    }

    errorList.push({
      key: key,
      value: errors[key],
    });
  }

  return errorList;
}
