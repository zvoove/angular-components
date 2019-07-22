import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PsFlipContainerModule } from '@prosoft/components/flip-container';
import { FlipContainerDemoComponent } from './flip-container-demo.component';

@NgModule({
  declarations: [FlipContainerDemoComponent],
  imports: [
    PsFlipContainerModule,
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
