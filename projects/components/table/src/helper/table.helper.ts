import { coerceNumberProperty } from '@angular/cdk/coercion';
import { IPsTableUpdateDataInfo } from '../models';

export function asQueryParams(settings: IPsTableUpdateDataInfo): string {
  return [settings.pageSize, settings.currentPage, settings.searchText, settings.sortColumn, settings.sortDirection].join('◬');
}

export function fromQueryParams(settingsString: string): IPsTableUpdateDataInfo {
  if (!settingsString) {
    return null;
  }

  const settings = settingsString.split('◬', 5);
  if (!settings.reduce((prev, curr) => prev || !!curr, false)) {
    return null;
  }

  return {
    pageSize: coerceNumberProperty(settings[0], null),
    currentPage: coerceNumberProperty(settings[1], null),
    searchText: settings[2] || null,
    sortColumn: settings[3] || null,
    sortDirection: coerceSortDirectionProperty(settings[4], null),
  };
}

function coerceSortDirectionProperty(input: unknown, fallback: 'asc' | 'desc' | null): 'asc' | 'desc' | null {
  const inputStr = (input + '').toLowerCase();
  if (inputStr === 'asc' || inputStr === 'desc') {
    return inputStr;
  }
  return fallback;
}

/**
 * Whether the provided value is considered a number.
 * @docs-private
 */
export function _isNumberValue(value: any): boolean {
  // parseFloat(value) handles most of the cases we're interested in (it treats null, empty string,
  // and other non-number values as NaN, where Number just uses 0) but it considers the string
  // '123hello' to be a valid number. Therefore we also check if Number(value) is NaN.
  return !isNaN(parseFloat(value as any)) && !isNaN(Number(value));
}
