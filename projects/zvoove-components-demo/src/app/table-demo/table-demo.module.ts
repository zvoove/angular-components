import { CommonModule } from '@angular/common';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ZvIntlService, ZvIntlServiceEn } from '@zvoove/components/core';
import { IZvTableSetting, ZvTableModule, ZvTableSettingsService } from '@zvoove/components/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TableDemoComponent } from './table-demo.component';

@Injectable()
export class DemoZvTableSettingsService extends ZvTableSettingsService {
  private settings$ = new BehaviorSubject<{ [id: string]: IZvTableSetting }>({});
  constructor() {
    super();
    this.settingsEnabled = true;
  }

  public override getStream(tableId: string): Observable<IZvTableSetting> {
    return this.settings$.pipe(map((settings) => settings[tableId]));
  }
  public override save(tableId: string, settings: IZvTableSetting): Observable<void> {
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
    ZvTableModule,
    MatFormFieldModule,
    RouterModule.forChild([
      {
        path: '',
        component: TableDemoComponent,
      },
    ]),
  ],
  providers: [
    { provide: ZvIntlService, useClass: ZvIntlServiceEn },
    { provide: ZvTableSettingsService, useClass: DemoZvTableSettingsService },
  ],
})
export class TableDemoModule {}
