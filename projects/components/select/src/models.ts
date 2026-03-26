export interface ZvSelectItem<T = unknown> {
  label: string;
  value: T;
  entity?: unknown;
  hidden?: boolean;
  disabled?: boolean;
}

export interface ZvSelectTriggerData {
  value: string;
  viewValue: string;
}
