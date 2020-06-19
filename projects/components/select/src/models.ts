export interface PsSelectItem<T = any> {
  label: string;
  value: T;
  entity?: any;
  hidden?: boolean;
  disabled?: boolean;
}
