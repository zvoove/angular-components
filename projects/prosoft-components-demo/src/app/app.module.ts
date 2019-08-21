import { NgModule } from '@angular/core';
import { GestureConfig } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    MatSidenavModule,
    MatToolbarModule,
    MatListModule,

    RouterModule.forRoot([
      {
        path: 'flip-container',
        loadChildren: () => import('./flip-container-demo/flip-container-demo.module').then(m => m.FlipContainerDemoModule),
      },
      {
        path: 'select',
        loadChildren: () => import('./select-demo/select-demo.module').then(m => m.SelectDemoModule),
      },
      {
        path: 'form-errors',
        loadChildren: () => import('./form-errors-demo/form-errors-demo.module').then(m => m.FormErrorsDemoModule),
      },
      {
        path: 'form-field',
        loadChildren: () => import('./form-field-demo/form-field-demo.module').then(m => m.FormFieldDemoModule),
      },
      {
        path: 'savebar',
        loadChildren: () => import('./savebar-demo/savebar-demo.module').then(m => m.SavebarDemoModule),
      },
      {
        path: 'block-ui',
        loadChildren: () => import('./block-ui-demo/block-ui-demo.module').then(m => m.BlockUiDemoModule),
      },
      {
        path: 'slider',
        loadChildren: () => import('./slider-demo/slider-demo.module').then(m => m.SliderDemoModule),
      },
      {
        path: 'form',
        loadChildren: () => import('./form-demo/form-demo.module').then(m => m.FormDemoModule),
      },
      {
        path: '**',
        pathMatch: 'full',
        loadChildren: () => import('./start-page/start-page.module').then(m => m.StartPageModule),
      },
    ]),
  ],
  providers: [{ provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }],
  bootstrap: [AppComponent],
})
export class AppModule {}
