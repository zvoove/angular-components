import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PsBlockUiModule } from '@prosoft/components/block-ui';
import { PsSavebarModule } from '@prosoft/components/savebar';
import { PsFormActionService } from './form-action.service';
import { PsFormComponent } from './form.component';

@NgModule({
  declarations: [PsFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,

    PsBlockUiModule,
    PsSavebarModule,
  ],
  exports: [PsFormComponent],
})
export class PsFormModule {
  public static forRoot(formActionServiceType: Type<PsFormActionService>): ModuleWithProviders {
    return {
      ngModule: PsFormModule,
      providers: [{ provide: PsFormActionService, useClass: formActionServiceType }],
    };
  }
}
