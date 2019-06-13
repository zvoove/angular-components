import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PsSelectModule } from '@prosoft/components/select';
import { StartPageComponent } from './start-page.component';

@NgModule({
  declarations: [StartPageComponent],
  imports: [
    PsSelectModule,
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
