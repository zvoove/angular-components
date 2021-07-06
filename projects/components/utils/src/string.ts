export function replaceAll(val: string, searchValue: string, replaceValue: string): string {
  // .replace interprets searchValue as a string and will only replace the first occurnce.
  // .replaceAll was added in ECMA-262 (2021) but is not currently available in nodeJS.

  // https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript/54414146
  // Solutions that do not work properly
  // - while indexOf() > -1: Lets somehow crash chrome during tests
  // - new Regex(searchValue, 'g'): Does not work because the dot and other characters would need to be escaped first
  // - Escaping searchValue and then new Regex(...): Does not look like a proper solution either

  val = val.split(searchValue).join(replaceValue);
  return val;
}
