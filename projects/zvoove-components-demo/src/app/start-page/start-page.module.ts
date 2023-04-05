import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZvSelectModule } from '@zvoove/components/select';
import { StartPageComponent } from './start-page.component';

@NgModule({
  declarations: [StartPageComponent],
  imports: [
    ZvSelectModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: StartPageComponent,
      },
    ]),
  ],
  providers: [],
})
export class StartPageModule {}
