import { coerceNumberProperty } from '@angular/cdk/coercion';
import { IPsTableUpdateDataInfo } from '../models';

export function asQueryParams(settings: IPsTableUpdateDataInfo): string {
  return [settings.pageSize, settings.currentPage, settings.searchText, settings.sortColumn, settings.sortDirection].join('◬');
}

export function fromQueryParams(settingsString: string): IPsTableUpdateDataInfo {
  if (!settingsString) {
    return undefined;
  }

  const settings = settingsString.split('◬', 5);
  if (!settings.reduce((prev, curr) => prev || !!curr, false)) {
    return undefined;
  }

  return <IPsTableUpdateDataInfo>{
    pageSize: coerceNumberProperty(settings[0], null),
    currentPage: coerceNumberProperty(settings[1], null),
    searchText: settings[2] || null,
    sortColumn: settings[3] || null,
    sortDirection: settings[4] || null,
  };
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
