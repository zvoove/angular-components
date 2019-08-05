import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

export interface IPsFormCancelParams {
  formMode: 'create' | 'update';
  route: ActivatedRoute;
}

export interface IPsFormLoadSuccessParams {
  value: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  form: FormGroup;
}

export interface IPsFormLoadErrorParams {
  error: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  form: FormGroup;
}

export interface IPsFormSaveParams {
  close: boolean;
}

export interface IPsFormSaveSuccessParams {
  value: any;
  saveResult: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  close: boolean;
  form: FormGroup;
}

export interface IPsFormSaveErrorParams {
  value: any;
  error: any;
  formMode: 'create' | 'update';
  route: ActivatedRoute;
  close: boolean;
  form: FormGroup;
}
