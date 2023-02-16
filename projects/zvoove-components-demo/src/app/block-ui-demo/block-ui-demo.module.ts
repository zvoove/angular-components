import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { ZvBlockUiModule } from '@zvoove/components/block-ui';
import { BlockUiDemoComponent } from './block-ui-demo.component';

@NgModule({
  imports: [
    CommonModule,
    ZvBlockUiModule,
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
    MatButtonModule,
  ],
  declarations: [BlockUiDemoComponent],
  providers: [],
})
export class BlockUiDemoModule {}
