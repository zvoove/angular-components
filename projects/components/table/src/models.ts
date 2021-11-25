export interface IPsTableSortDefinition {
  prop: string;
  displayName: string;
}

export interface IPsTableUpdateDataInfo {
  currentPage: number | null;
  pageSize: number | null;
  searchText: string | null;
  sortDirection: 'asc' | 'desc' | null;
  sortColumn: string | null;
}

export interface IExtendedPsTableUpdateDataInfo<TTrigger> extends IPsTableUpdateDataInfo {
  currentPage: number;
  pageSize: number;
  triggerData: TTrigger;
}

export const enum PsTableActionScope {
  row = 1,
  list = 2,
  // eslint-disable-next-line no-bitwise
  all = row | list,
}

export interface IPsTableAction<T> {
  label: string;
  icon: string;
  isSvgIcon?: boolean;
  iconColor?: string;
  children?: IPsTableAction<T>[];
  scope: PsTableActionScope;
  isDisabledFn?: (items: T[]) => boolean;
  isHiddenFn?: (items: T[]) => boolean;
  actionFn?: (items: T[]) => void;
  routerLink?: (item: T[]) => IPsTableActionRouterLink;
}

export interface IPsTableActionRouterLink {
  path: string[];
  queryParams?: { [key: string]: any };
}
