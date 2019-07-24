export interface IPsFormErrorData {
  controlPath: string;
  errorKey: string;
  errorValue: any;
  isControl: boolean;
}

export interface IPsFormError {
  data: IPsFormErrorData;
  errorText: string;
}
