import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: 'flip-container',
        loadChildren: () => import('./flip-container-demo/flip-container-demo.module').then(m => m.FlipContainerDemoModule),
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'flip-container',
      },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
