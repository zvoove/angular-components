import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PsFormErrorsModule } from '@prosoft/components/form-errors';
import { PsSavebarRightContentDirective } from './savebar-right-content.directive';
import { PsSavebarComponent } from './savebar.component';
import { PsSavebarIntl } from './savebar.intl';

@NgModule({
  imports: [CommonModule, MatCardModule, MatButtonModule, PsFormErrorsModule],
  declarations: [PsSavebarComponent, PsSavebarRightContentDirective],
  exports: [PsSavebarComponent, PsSavebarRightContentDirective],
})
export class PsSavebarModule {
  public static forRoot(savebarIntlType: any): ModuleWithProviders {
    return {
      ngModule: PsSavebarModule,
      providers: [{ provide: PsSavebarIntl, useClass: savebarIntlType }],
    };
  }
}
