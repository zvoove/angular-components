import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { BlockUiDemoComponent } from './block-ui-demo.component';

@NgModule({
  imports: [
    CommonModule,
    PsBlockUiModule,
    RouterModule.forChild([
      {
        path: '',
        component: BlockUiDemoComponent,
      },
    ]),
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
  ],
  declarations: [BlockUiDemoComponent],
  providers: [],
})
export class BlockUiDemoModule {}
