export interface IZvTableSortDefinition {
  prop: string;
  displayName: string;
}

export interface IZvTableSort {
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
}

export interface IZvTableUpdateDataInfo {
  currentPage: number | null;
  pageSize: number | null;
  searchText: string | null;
  sortDirection: 'asc' | 'desc' | null;
  sortColumn: string | null;
}

export interface IExtendedZvTableUpdateDataInfo<TTrigger> extends IZvTableUpdateDataInfo {
  currentPage: number;
  pageSize: number;
  triggerData: TTrigger;
}

export const enum ZvTableActionScope {
  row = 1,
  list = 2,
  // eslint-disable-next-line no-bitwise
  all = row | list,
}

export interface IZvTableAction<T> {
  label: string;
  icon: string;
  isSvgIcon?: boolean;
  iconColor?: string;
  children?: IZvTableAction<T>[];
  scope: ZvTableActionScope;
  isDisabledFn?: (items: T[]) => boolean;
  isHiddenFn?: (items: T[]) => boolean;
  actionFn?: (items: T[]) => void;
  routerLink?: (item: T[]) => IZvTableActionRouterLink;
}

export interface IZvTableActionRouterLink {
  path: string[];
  queryParams?: { [key: string]: any };
}
