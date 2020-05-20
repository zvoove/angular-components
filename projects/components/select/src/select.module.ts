import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PsErrorMessagePipeModule } from '@prosoft/components/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { PsSelectDataComponent } from './select-data.component';
import { PsSelectOptionTemplateDirective } from './select-option-template.directive';
import { PsSelectTriggerTemplateDirective } from './select-trigger-template.directive';
import { PsSelectComponent } from './select.component';
import { PsSelectService } from './select.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMatSelectSearchModule,
    PsErrorMessagePipeModule,
  ],
  declarations: [PsSelectComponent, PsSelectDataComponent, PsSelectOptionTemplateDirective, PsSelectTriggerTemplateDirective],
  exports: [MatSelectModule, PsSelectComponent, PsSelectDataComponent, PsSelectOptionTemplateDirective, PsSelectTriggerTemplateDirective],
  entryComponents: [],
})
export class PsSelectModule {
  public static forRoot(selectServiceType: any): ModuleWithProviders {
    return {
      ngModule: PsSelectModule,
      providers: [{ provide: PsSelectService, useClass: selectServiceType }],
    };
  }
}
