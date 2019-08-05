import { Injectable } from '@angular/core';
import {
  IPsFormCancelParams,
  IPsFormLoadErrorParams,
  IPsFormLoadSuccessParams,
  IPsFormSaveErrorParams,
  IPsFormSaveSuccessParams,
} from './models';

@Injectable()
export abstract class PsFormActionService {
  public abstract defaultCancelHandler(params: IPsFormCancelParams): void;

  public abstract defaultLoadSuccessHandler(params: IPsFormLoadSuccessParams): void;
  public abstract defaultLoadErrorHandler(params: IPsFormLoadErrorParams): void;

  public abstract defaultSaveSuccessHandler(params: IPsFormSaveSuccessParams): void;
  public abstract defaultSaveErrorHandler(params: IPsFormSaveErrorParams): void;
}
