import { Provider, Type } from '@angular/core';
import { ZvFormService } from './form.service';

export function provideFormService(formsServiceType: Type<ZvFormService>): Provider[] {
  return [{ provide: ZvFormService, useClass: formsServiceType }];
}
