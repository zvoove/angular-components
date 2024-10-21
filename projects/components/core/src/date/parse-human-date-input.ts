export const INVALID_DATE = new Date(NaN);

export const detectDmyOrder = (locale: string) => {
  const dateTimeFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const dmyOrder = dateTimeFormat
    .formatToParts(new Date(2222, 5, 1))
    .map((p) => p.type.substring(0, 1))
    .filter((p) => ['d', 'm', 'y'].includes(p)) as ['d' | 'm' | 'y', 'd' | 'm' | 'y', 'd' | 'm' | 'y'];
  return dmyOrder;
};

const dateParserExact = /^(\d+)[./, ](\d+)[./, ](\d+)$/;
const fuzzyRegexMap = {
  d: '(\\d{2})',
  m: '(\\d{2})',
  y: '(\\d{2,4})',
};

export const parseHumanDateInput = (
  currentYear: number,
  dmyOrder: ['d' | 'm' | 'y', 'd' | 'm' | 'y', 'd' | 'm' | 'y'],
  value: unknown
): Date | null => {
  if (!value) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
  const stringValue = `${value}`.trim();
  const dateParserFuzzy = new RegExp(`^${dmyOrder.map((c) => fuzzyRegexMap[c]).join('')}$`);
  const match = stringValue.match(dateParserExact) || stringValue.match(dateParserFuzzy);
  if (!match) {
    return INVALID_DATE;
  }

  const dateParts = {
    d: +match[dmyOrder.indexOf('d') + 1],
    m: +match[dmyOrder.indexOf('m') + 1],
    y: match[dmyOrder.indexOf('y') + 1],
  };
  const day = dateParts.d;
  if (day > 31) {
    return INVALID_DATE;
  }

  const month = dateParts.m - 1;
  if (month > 11) {
    return INVALID_DATE;
  }

  let year = +dateParts.y;
  if (dateParts.y.length <= 2) {
    const currentCentury = Math.round(currentYear / 100) * 100;
    const difference = year - (currentYear - currentCentury);
    year = year + currentCentury;
    // If it were more than 10 years in the future with the same century, let's take the last century.
    if (difference > 10) {
      year = year - 100;
    }
  }
  return new Date(year, month, day);
};
