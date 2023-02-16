import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ZvErrorMessagePipeModule } from '@zvoove/components/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ZvSelectOptionTemplateDirective } from './select-option-template.directive';
import { ZvSelectTriggerTemplateDirective } from './select-trigger-template.directive';
import { ZvSelectComponent } from './select.component';
import { ZvSelectService } from './select.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMatSelectSearchModule,
    ZvErrorMessagePipeModule,
  ],
  declarations: [ZvSelectComponent, ZvSelectOptionTemplateDirective, ZvSelectTriggerTemplateDirective],
  exports: [MatSelectModule, ZvSelectComponent, ZvSelectOptionTemplateDirective, ZvSelectTriggerTemplateDirective],
})
export class ZvSelectModule {
  public static forRoot(selectServiceType: any): ModuleWithProviders<ZvSelectModule> {
    return {
      ngModule: ZvSelectModule,
      providers: [{ provide: ZvSelectService, useClass: selectServiceType }],
    };
  }
}
