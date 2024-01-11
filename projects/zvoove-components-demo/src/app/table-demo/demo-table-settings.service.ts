import { Injectable, OnDestroy } from '@angular/core';
import { IZvTableSetting, ZvTableSettingsService } from '@zvoove/components/table';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class DemoTableSettingsService extends ZvTableSettingsService implements OnDestroy {
  private settingsUpdater = new ReplaySubject<IZvTableSetting>(1);
  private localStoragePrefix = 'table-settings';
  public settings$ = this.settingsUpdater.asObservable();

  constructor() {
    super();
    this.settingsEnabled = true;
  }

  public override save(tableId: string, settings: IZvTableSetting): Observable<void> {
    this.writeToLocalStorage(tableId, settings);
    this.settingsUpdater.next(settings);
    return EMPTY;
  }

  public override getStream(tableId: string): Observable<IZvTableSetting> {
    const savedSettings = this.readFromLocalStorage(tableId);
    if (savedSettings) {
      this.settingsUpdater.next(savedSettings);
    } else {
      this.settingsUpdater.next({} as IZvTableSetting);
    }

    return this.settings$;
  }

  private readFromLocalStorage(tableId: string): IZvTableSetting | null {
    const settingsString = localStorage.getItem(`${this.localStoragePrefix}:${tableId}`);

    if (settingsString) {
      return JSON.parse(settingsString) as IZvTableSetting;
    }
    return null;
  }

  private writeToLocalStorage(tableId: string, settings: IZvTableSetting): void {
    localStorage.setItem(`${this.localStoragePrefix}:${tableId}`, JSON.stringify(settings));
  }

  public ngOnDestroy() {
    this.settingsUpdater.complete();
  }
}
