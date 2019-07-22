export interface IPsFormErrorData {
  controlPath: string;
  errorKey: string;
  errorValue: any;
  isControl: boolean;
}

export interface PsFormError {
  data: IPsFormErrorData;
  errorText: string;
}
