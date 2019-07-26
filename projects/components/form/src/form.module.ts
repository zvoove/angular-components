import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PsFormErrorsComponent } from './form-errors/form-errors.component';
import { PsFormFieldComponent } from './form-field/form-field.component';
import { PsFormService } from './form.service';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MatChipsModule, MatFormFieldModule],
  declarations: [PsFormErrorsComponent, PsFormFieldComponent],
  exports: [PsFormErrorsComponent, PsFormFieldComponent],
})
export class PsFormModule {
  public static forRoot(selectServiceType: any): ModuleWithProviders {
    return {
      ngModule: PsFormModule,
      providers: [{ provide: PsFormService, useClass: selectServiceType }],
    };
  }
}
