const dateParserExact = /^(\d{0,2})[^0-9](\d{0,2})([^0-9]*)$/;
const dateParserFuzzy3to4 = /^(\d{1,2})(\d{2})([^0-9]*)$/;
const dateParserFuzzy2 = /^(\d{1,2})()([^0-9]*)$/;

export const parseHumanTimeInput = (value: unknown): [number, number] | typeof NaN | null => {
  if (!value) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
  const stringValue = `${value}`.trim();
  const match = stringValue.match(dateParserExact) || stringValue.match(dateParserFuzzy3to4) || stringValue.match(dateParserFuzzy2);
  if (!match || (match[1] === '' && match[2] === '')) {
    return NaN;
  }

  const minutes = +match[2];
  if (minutes > 59 || minutes < 0) {
    return NaN;
  }
  let hours = +match[1];
  const ampm = match[3].replace(/[^pamPAM]/g, '').toLocaleLowerCase();
  if (hours > 23 || hours < 0 || (ampm && hours > 12)) {
    return NaN;
  }
  if (ampm === 'pm' && hours < 12) {
    hours += 12;
  }
  if (ampm === 'am' && hours == 12) {
    hours -= 12;
  }
  return [hours, minutes];
};
