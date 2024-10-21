import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';

export interface IZvTableSetting {
  columnBlacklist: string[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class ZvTableSettingsService {
  public settingsEnabled = false;
  public preferSortDropdown = false;
  public pageSizeOptions = [5, 10, 25, 50];
  public getStream(_tableId: string, _onlySaved: boolean): Observable<IZvTableSetting> {
    return of({
      columnBlacklist: [],
      sortColumn: null,
      sortDirection: null,
      pageSize: 15,
    });
  }

  public save(_: string, __: IZvTableSetting): Observable<void> {
    return EMPTY;
  }
}
