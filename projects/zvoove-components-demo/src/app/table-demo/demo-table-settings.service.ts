import { isPlatformServer } from '@angular/common';
import { inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { IZvTableSetting, ZvTableSettingsService } from '@zvoove/components/table';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class DemoTableSettingsService extends ZvTableSettingsService implements OnDestroy {
  private settingsUpdater = new ReplaySubject<IZvTableSetting>(1);
  private localStoragePrefix = 'table-settings';
  public settings$ = this.settingsUpdater.asObservable();
  private isServer = isPlatformServer(inject(PLATFORM_ID));

  constructor() {
    super();
    this.settingsEnabled = true;
  }

  public override save(tableId: string, settings: IZvTableSetting): Observable<void> {
    return new Observable<void>((subscriber) => {
      this.writeToLocalStorage(tableId, settings);
      this.settingsUpdater.next(settings);
      subscriber.next();
    });
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
    if (this.isServer) {
      return null;
    }
    const settingsString = localStorage.getItem(`${this.localStoragePrefix}:${tableId}`);

    if (settingsString) {
      return JSON.parse(settingsString) as IZvTableSetting;
    }
    return null;
  }

  private writeToLocalStorage(tableId: string, settings: IZvTableSetting): void {
    if (!this.isServer) {
      localStorage?.setItem(`${this.localStoragePrefix}:${tableId}`, JSON.stringify(settings));
    }
  }

  public ngOnDestroy() {
    this.settingsUpdater.complete();
  }
}
