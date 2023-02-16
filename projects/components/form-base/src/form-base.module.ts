import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { ZvFormService } from './form.service';

@NgModule({})
export class ZvFormBaseModule {
  public static forRoot(formsServiceType: Type<ZvFormService>): ModuleWithProviders<ZvFormBaseModule> {
    return {
      ngModule: ZvFormBaseModule,
      providers: [{ provide: ZvFormService, useClass: formsServiceType }],
    };
  }
}
