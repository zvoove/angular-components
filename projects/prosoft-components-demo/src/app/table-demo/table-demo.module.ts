import { CommonModule } from '@angular/common';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { PsIntlService, PsIntlServiceEn } from '@prosoft/components/core';
import { IPsTableSetting, PsTableModule, PsTableSettingsService } from '@prosoft/components/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableDemoComponent } from './table-demo.component';

@Injectable()
export class DemoPsTableSettingsService extends PsTableSettingsService {
  private settings$ = new BehaviorSubject<{ [id: string]: IPsTableSetting }>({});
  constructor() {
    super();
    this.settingsEnabled = true;
  }

  public getStream(tableId: string): Observable<IPsTableSetting> {
    return this.settings$.pipe(map(settings => settings[tableId]));
  }
  public save(tableId: string, settings: IPsTableSetting): Observable<void> {
    this.settings$.next({ [tableId]: settings });
    return of(null);
  }
}

@NgModule({
  declarations: [TableDemoComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    PsTableModule,
    MatFormFieldModule,
    RouterModule.forChild([
      {
        path: '',
        component: TableDemoComponent,
      },
    ]),
  ],
  providers: [
    { provide: PsIntlService, useClass: PsIntlServiceEn },
    { provide: PsTableSettingsService, useClass: DemoPsTableSettingsService },
  ],
})
export class TableDemoModule {}
