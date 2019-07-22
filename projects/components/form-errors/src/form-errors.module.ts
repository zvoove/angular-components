import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { PsFormErrorsComponent } from './form-errors.component';
import { PsFormErrorsService } from './form-errors.service';

@NgModule({
  imports: [CommonModule, MatChipsModule, ReactiveFormsModule],
  declarations: [PsFormErrorsComponent],
  exports: [PsFormErrorsComponent],
})
export class PsFormErrorsModule {
  public static forRoot(selectServiceType: any): ModuleWithProviders {
    return {
      ngModule: PsFormErrorsModule,
      providers: [{ provide: PsFormErrorsService, useClass: selectServiceType }],
    };
  }
}
