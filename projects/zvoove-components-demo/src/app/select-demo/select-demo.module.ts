import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { DefaultZvSelectService, ZvSelectModule } from '@zvoove/components/select';

import { SelectWithCustomSelectServiceComponent } from './demos/select-with-custom-select-service.component';
import { SelectWithCustomTemplateComponent } from './demos/select-with-custom-template.component';
import { SelectWithEndlessLoadingDataSourceComponent } from './demos/select-with-endless-loading-datasource.component';
import { SelectWithErrorInDataSourceComponent } from './demos/select-with-error-in-datasource.component';
import { SelectWithErrorStateMatcherComponent } from './demos/select-with-error-state-matcher.component';
import { SelectWithEventsOnlyComponent } from './demos/select-with-events-only.component';
import { SelectWithMultiselectComponent } from './demos/select-with-multiselect.component';
import { SelectWithNgModelComponent } from './demos/select-with-ng-model.component';
import { SelectWithOtherLoadTriggerComponent } from './demos/select-with-other-load-trigger.component';
import { SelectWithSelectedItemNotInDataSourceComponent } from './demos/select-with-selected-item-not-in-datasource.component';
import { SelectDemoComponent } from './select-demo.component';
import { MatButtonModule } from '@angular/material/button';

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
    SelectWithErrorStateMatcherComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZvSelectModule.forRoot(DefaultZvSelectService),
    CommonModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatInputModule,
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
