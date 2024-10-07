import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ZvSelectOptionTemplate } from './directives/select-option-template.directive';
import { ZvSelectTriggerTemplate } from './directives/select-trigger-template.directive';
import { ZvSelect } from './select.component';
import { ZvSelectService } from './services/select.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    NgxMatSelectSearchModule,
    ZvErrorMessagePipe,
    ZvSelect,
    ZvSelectOptionTemplate,
    ZvSelectTriggerTemplate,
  ],
  exports: [ZvSelect, ZvSelectOptionTemplate, ZvSelectTriggerTemplate],
})
export class ZvSelectModule {
  /** @deprecated Use provideSelectService */
  public static forRoot(selectServiceType: Type<ZvSelectService>): ModuleWithProviders<ZvSelectModule> {
    return {
      ngModule: ZvSelectModule,
      providers: [{ provide: ZvSelectService, useClass: selectServiceType }],
    };
  }
}

export function provideSelectService(selectServiceType: Type<ZvSelectService>): Provider[] {
  return [{ provide: ZvSelectService, useClass: selectServiceType }];
}
