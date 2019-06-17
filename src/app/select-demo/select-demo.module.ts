import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { DefaultPsSelectService, PsSelectModule } from '@prosoft/components/select';
import { SelectWithCustomSelectServiceComponent } from './demos/select-with-custom-select-service.component';
import { SelectWithCustomTemplateComponent } from './demos/select-with-custom-template.component';
import { SelectWithEndlessLoadingDataSourceComponent } from './demos/select-with-endless-loading-datasource.component';
import { SelectWithErrorInDataSourceComponent } from './demos/select-with-error-in-datasource.component';
import { SelectWithEventsOnlyComponent } from './demos/select-with-events-only.component';
import { SelectWithMultiselectComponent } from './demos/select-with-multiselect.component';
import { SelectWithNgModelComponent } from './demos/select-with-ng-model.component';
import { SelectWithOtherLoadTriggerComponent } from './demos/select-with-other-load-trigger.component';
import { SelectWithSelectedItemNotInDataSourceComponent } from './demos/select-with-selected-item-not-in-datasource.component';
import { SelectDemoComponent } from './select-demo.component';

@NgModule({
  declarations: [
    SelectDemoComponent,
    SelectWithNgModelComponent,
    SelectWithEventsOnlyComponent,
    SelectWithSelectedItemNotInDataSourceComponent,
    SelectWithEndlessLoadingDataSourceComponent,
    SelectWithErrorInDataSourceComponent,
    SelectWithOtherLoadTriggerComponent,
    SelectWithMultiselectComponent,
    SelectWithCustomSelectServiceComponent,
    SelectWithCustomTemplateComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    PsSelectModule.forRoot(DefaultPsSelectService),
    CommonModule,
    MatFormFieldModule,
    MatRadioModule,
    RouterModule.forChild([
      {
        path: '',
        component: SelectDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class SelectDemoModule {}
