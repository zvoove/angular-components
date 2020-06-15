import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsFormBaseModule } from '@prosoft/components/form-base';
import { PsSavebarModule } from '@prosoft/components/savebar';

import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { SavebarDemoComponent } from './savebar-demo.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsSavebarModule,
    RouterModule.forChild([
      {
        path: '',
        component: SavebarDemoComponent,
      },
    ]),
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  declarations: [SavebarDemoComponent],
  providers: [],
})
export class SavebarDemoModule {}
