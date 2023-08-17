import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { IZvTableIntlTexts } from '@zvoove/components/core';
import { Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { ZvTableColumnDirective } from '../directives/table.directives';
import { IZvTableSortDefinition } from '../models';
import { IZvTableSetting, ZvTableSettingsService } from '../services/table-settings.service';

@Component({
  selector: 'zv-table-settings',
  templateUrl: './table-settings.component.html',
  styles: [
    `
      .zv-table-settings__form {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .zv-table-settings__form > * {
        min-width: 20%;
      }
      .zv-table-settings__form__display-columns {
        display: flex;
        flex-direction: column;
      }
      .zv-table-settings__actions {
        justify-content: end;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZvTableSettingsComponent implements OnInit {
  @Input() public intl: IZvTableIntlTexts;
  @Input() public tableId: string;
  @Input() public columnDefinitions: ZvTableColumnDirective[] = [];
  @Input() public sortDefinitions: IZvTableSortDefinition[] = [];
  @Input() public pageSizeOptions: number[];
  @Input() public customSettings: TemplateRef<any> | null = null;

  @Output() public readonly settingsSaved = new EventEmitter<void>();
  @Output() public readonly settingsAborted = new EventEmitter<void>();

  public settings$: Observable<IZvTableSetting>;

  private _settingSaveSub: Subscription;

  constructor(public settingsService: ZvTableSettingsService) {}

  public ngOnInit(): void {
    this.settings$ = this.settingsService.getStream(this.tableId, true).pipe(
      map((settings) => {
        settings = settings || ({} as IZvTableSetting);
        return <IZvTableSetting>{
          ...settings,
          columnBlacklist: settings.columnBlacklist || [],
          pageSize: settings.pageSize || 15,
          sortDirection: settings.sortDirection || 'asc',
        };
      })
    );
  }

  public columnVisible(settings: IZvTableSetting, columnDef: ZvTableColumnDirective) {
    return !settings.columnBlacklist.some((x) => x === columnDef.property);
  }

  public onSortChanged(event: { sortColumn: string; sortDirection: 'asc' | 'desc' }, settings: IZvTableSetting) {
    if (settings.sortColumn !== event.sortColumn) {
      settings.sortColumn = event.sortColumn;
      settings.columnBlacklist = settings.columnBlacklist.filter((x) => x !== event.sortColumn);
    }
    settings.sortDirection = event.sortDirection;
  }

  public onColumnVisibilityChange(event: MatCheckboxChange, settings: IZvTableSetting, columnDef: ZvTableColumnDirective) {
    if (event.checked) {
      settings.columnBlacklist = settings.columnBlacklist.filter((x) => x !== columnDef.property);
    } else if (!settings.columnBlacklist.find((x) => x === columnDef.property)) {
      settings.columnBlacklist.push(columnDef.property);
    }
  }

  public onSaveClick(setting: IZvTableSetting) {
    if (this._settingSaveSub) {
      this._settingSaveSub.unsubscribe();
    }
    this._settingSaveSub = this.settingsService
      .save(this.tableId, setting)
      .pipe(first())
      .subscribe({
        complete: () => this.settingsSaved.emit(),
      });
  }

  public onCancelClick() {
    this.settingsAborted.emit();
  }
}
