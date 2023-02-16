export interface IZvFormErrorData {
  controlPath: string;
  errorKey: string;
  errorValue: any;
  isControl: boolean;
}

export interface IZvFormError {
  data: IZvFormErrorData;
  errorText: string;
}
