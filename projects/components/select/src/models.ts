export interface ZvSelectItem<T = any> {
  label: string;
  value: T;
  entity?: any;
  hidden?: boolean;
  disabled?: boolean;
}

export interface ZvSelectTriggerData {
  value: string;
  viewValue: string;
}
