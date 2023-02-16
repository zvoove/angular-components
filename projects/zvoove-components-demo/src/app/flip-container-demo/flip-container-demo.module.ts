import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ZvFlipContainerModule } from '@zvoove/components/flip-container';
import { ZvFormBaseModule } from '@zvoove/components/form-base';
import { ZvFormFieldModule } from '@zvoove/components/form-field';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FlipContainerDemoComponent } from './flip-container-demo.component';

@NgModule({
  declarations: [FlipContainerDemoComponent],
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    ZvFlipContainerModule,
    ZvFormBaseModule.forRoot(DemoZvFormsService),
    ZvFormFieldModule,
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
