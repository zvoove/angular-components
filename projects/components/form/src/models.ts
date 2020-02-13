import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** @deprecated */
export interface IPsFormCancelParams {
  formMode: 'create' | 'update';
  route: ActivatedRoute;
}

/** @deprecated */
export interface IPsFormLoadSuccessParams {
  value: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  form: FormGroup;
}

/** @deprecated */
export interface IPsFormLoadErrorParams {
  error: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  form: FormGroup;
}

/** @deprecated */
export interface IPsFormSaveParams {
  close: boolean;
}

/** @deprecated */
export interface IPsFormSaveSuccessParams {
  value: any;
  saveResult: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  close: boolean;
  form: FormGroup;
}

/** @deprecated */
export interface IPsFormSaveErrorParams {
  value: any;
  error: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  close: boolean;
  form: FormGroup;
}
