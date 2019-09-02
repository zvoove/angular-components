import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { PsIntlService, PsIntlServiceEn } from '@prosoft/components/core';
import { IPsTableSetting, PsTableModule, PsTableSettingsService } from '@prosoft/components/table';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { TableDemoComponent } from './table-demo.component';

export class DemoPsTableSettingsService extends PsTableSettingsService {
  constructor() {
    super();
    this.settingsEnabled = true;
    this.settings$ = new BehaviorSubject<{ [id: string]: IPsTableSetting }>({});
  }
  public save(tableId: string, settings: IPsTableSetting): Observable<void> {
    (this.settings$ as Subject<{ [id: string]: IPsTableSetting }>).next({ [tableId]: settings });
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
