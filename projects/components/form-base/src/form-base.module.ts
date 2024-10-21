import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { ZvFormService } from './form.service';

/** @deprecated Use provideFormService instead */
@NgModule({})
export class ZvFormBaseModule {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  public static forRoot(formsServiceType: Type<ZvFormService>): ModuleWithProviders<ZvFormBaseModule> {
    return {
      ngModule: ZvFormBaseModule,
      providers: [{ provide: ZvFormService, useClass: formsServiceType }],
    };
  }
}

export function provideFormService(formsServiceType: Type<ZvFormService>): Provider[] {
  return [{ provide: ZvFormService, useClass: formsServiceType }];
}
