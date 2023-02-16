import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ZvCardModule } from '@zvoove/components/card';
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
    ZvCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: [CardDemoComponent],
})
export class CardDemoModule {}
