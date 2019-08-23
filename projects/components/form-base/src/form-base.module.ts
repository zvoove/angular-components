import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { PsFormService } from './form.service';

@NgModule({})
export class PsFormBaseModule {
  public static forRoot(formsServiceType: Type<PsFormService>): ModuleWithProviders {
    return {
      ngModule: PsFormBaseModule,
      providers: [{ provide: PsFormService, useClass: formsServiceType }],
    };
  }
}
