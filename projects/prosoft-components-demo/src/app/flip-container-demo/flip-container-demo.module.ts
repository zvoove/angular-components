import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsFlipContainerModule } from '@prosoft/components/flip-container';
import { PsFormBaseModule } from '@prosoft/components/form-base';
import { PsFormFieldModule } from '@prosoft/components/form-field';
import { DemoPsFormsService } from '../common/demo-ps-form-service';
import { FlipContainerDemoComponent } from './flip-container-demo.component';

@NgModule({
  declarations: [FlipContainerDemoComponent],
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    PsFlipContainerModule,
    PsFormBaseModule.forRoot(DemoPsFormsService),
    PsFormFieldModule,
    RouterModule.forChild([
      {
        path: '',
        component: FlipContainerDemoComponent,
      },
    ]),
  ],
  providers: [],
})
export class FlipContainerDemoModule {}
