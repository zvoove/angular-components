import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule } from '@angular/router';
import { ZvViewModule } from '@zvoove/components/view';
import { ViewDemoComponent } from './view-demo.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewDemoComponent,
      },
    ]),
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    ZvViewModule,
  ],
  declarations: [ViewDemoComponent],
})
export class ViewDemoModule {}
