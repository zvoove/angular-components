import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';

export interface IPsTableSetting {
  columnBlacklist: string[];
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class PsTableSettingsService {
  public defaultPageSize$: Observable<number> = of(15);
  public settings$: Observable<{ [id: string]: IPsTableSetting }> = of({});

  public settingsEnabled = false;
  public pageSizeOptions = [5, 10, 25, 50];

  public save(_: string, __: IPsTableSetting): Observable<void> {
    return EMPTY;
  }
}
