import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PsCardModule } from '@prosoft/components/card';
import { CardDemoComponent } from './card-demo.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CardDemoComponent,
      },
    ]),
    PsCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: [CardDemoComponent],
})
export class CardDemoModule {}
