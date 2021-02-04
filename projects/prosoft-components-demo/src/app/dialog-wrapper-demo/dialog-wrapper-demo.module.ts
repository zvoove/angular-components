import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PsDialogWrapperModule } from '@prosoft/components/dialog-wrapper';
import { DialogWrapperDemoComponent, DialogWrapperDemoDialog } from './dialog-wrapper-demo.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DialogWrapperDemoComponent,
      },
    ]),
    MatButtonModule,
    PsDialogWrapperModule,
  ],
  declarations: [DialogWrapperDemoComponent, DialogWrapperDemoDialog],
})
export class DialogWrapperDemoModule {}
