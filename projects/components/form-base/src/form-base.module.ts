import { ModuleWithProviders, NgModule } from '@angular/core';
import { PsFormService } from './form.service';

@NgModule({})
export class PsFormBaseModule {
  public static forRoot(formsServiceType: any): ModuleWithProviders {
    return {
      ngModule: PsFormBaseModule,
      providers: [{ provide: PsFormService, useClass: formsServiceType }],
    };
  }
}
