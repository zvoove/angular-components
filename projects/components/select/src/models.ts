export interface PsSelectItem<T = any> {
  label: string;
  value: T;
  hidden?: boolean;
}
