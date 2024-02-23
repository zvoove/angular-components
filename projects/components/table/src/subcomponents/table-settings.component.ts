import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { Observable, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { ZvTableColumn } from '../directives/table.directives';
import { IZvTableSort, IZvTableSortDefinition } from '../models';
import { IZvTableSetting, ZvTableSettingsService } from '../services/table-settings.service';
import { ZvTableSortComponent } from './table-sort.component';

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
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCheckbox,
    ZvTableSortComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    NgTemplateOutlet,
    MatCardActions,
    MatButton,
    AsyncPipe,
  ],
})
export class ZvTableSettingsComponent implements OnInit {
  @Input() public tableId: string;
  @Input() public columnDefinitions: ZvTableColumn[] = [];
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

  public columnVisible(settings: IZvTableSetting, columnDef: ZvTableColumn) {
    return !settings.columnBlacklist.some((x) => x === columnDef.property);
  }

  public onSortChanged(event: IZvTableSort, settings: IZvTableSetting) {
    if (settings.sortColumn !== event.sortColumn) {
      settings.sortColumn = event.sortColumn;
      settings.columnBlacklist = settings.columnBlacklist.filter((x) => x !== event.sortColumn);
    }
    settings.sortDirection = event.sortDirection;
  }

  public onColumnVisibilityChange(event: MatCheckboxChange, settings: IZvTableSetting, columnDef: ZvTableColumn) {
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
