export interface IZvFormErrorData {
  controlPath: string;
  errorKey: string;
  errorValue: unknown;
  isControl: boolean;
}

export interface IZvFormError {
  data: IZvFormErrorData;
  errorText: string;
}
