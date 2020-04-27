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
  public settingsEnabled = false;
  public pageSizeOptions = [5, 10, 25, 50];
  public getStream(tableId: string, onlySaved: boolean): Observable<IPsTableSetting> {
    return of({
      columnBlacklist: [],
      sortColumn: null,
      sortDirection: null,
      pageSize: 15,
    });
  }

  public save(_: string, __: IPsTableSetting): Observable<void> {
    return EMPTY;
  }
}
