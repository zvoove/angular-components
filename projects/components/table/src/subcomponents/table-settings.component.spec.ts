import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatCardModule, MatCardActions } from '@angular/material/card';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IPsTableIntlTexts } from '@prosoft/components/core';
import { of } from 'rxjs';
import { PsTableColumnDirective } from '../directives/table.directives';
import { IPsTableSortDefinition } from '../models';
import { IPsTableSetting, PsTableSettingsService } from '../services/table-settings.service';
import { PsTableSettingsComponent } from './table-settings.component';
import { PsTableSortComponent } from './table-sort.component';
import { By } from '@angular/platform-browser';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-table-settings
      [tableId]="tableId"
      [columnDefinitions]="columnDefinitions"
      [sortDefinitions]="sortDefinitions"
      [pageSizeOptions]="pageSizeOptions"
      [intl]="intl"
      (settingsSaved)="onSettingsSaved($event)"
      (settingsAborted)="onSettingsAborted($event)"
    ></ps-table-settings>
  `,
})
export class TestComponent {
  public intl: Partial<IPsTableIntlTexts> = {
    sortLabel: 'sort label',
  };
  public tableId: string;
  public columnDefinitions: PsTableColumnDirective[] = [];
  public sortDefinitions: IPsTableSortDefinition[] = [];
  public pageSizeOptions: number[] = [1, 3, 7];

  @ViewChild(PsTableSettingsComponent, { static: true }) tableSearch: PsTableSettingsComponent;

  public onSettingsSaved() {}
  public onSettingsAborted() {}
}

describe('PsTableSettingsComponent', () => {
  describe('integration', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          NoopAnimationsModule,
          CommonModule,
          MatCardModule,
          MatFormFieldModule,
          MatSelectModule,
          MatCheckboxModule,
          MatButtonModule,
          MatIconModule,
        ],
        declarations: [TestComponent, PsTableSettingsComponent, PsTableSortComponent],
      }).compileComponents();
    }));

    it('should emit settingsAborted on cancel click', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      spyOn(component, 'onSettingsAborted');

      const [, cancelBtn] = fixture.debugElement.query(By.directive(MatCardActions)).queryAll(By.directive(MatButton));

      cancelBtn.triggerEventHandler('click', null);

      expect(component.onSettingsAborted).toHaveBeenCalled();
    }));

    it('should call service save and emit settingsSaved on save click', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const settings: IPsTableSetting = {
        columnBlacklist: ['prop_b'],
        pageSize: 11,
        sortColumn: 'prop_a',
        sortDirection: 'desc',
      };
      component.tableId = 'tableA';
      component.tableSearch.settingsService.getStream = () => of(settings);
      fixture.detectChanges();

      spyOn(component, 'onSettingsSaved');
      spyOn(component.tableSearch.settingsService, 'save').and.returnValue(of(null).pipe(delay(10)));

      const [saveButton] = fixture.debugElement.query(By.directive(MatCardActions)).queryAll(By.directive(MatButton));

      saveButton.triggerEventHandler('click', null);

      expect(component.tableSearch.settingsService.save).toHaveBeenCalledWith('tableA', settings);

      tick(10);

      expect(component.onSettingsSaved).toHaveBeenCalled();
    }));
  });

  describe('isolated', () => {
    it('should get settings from the service by tableId', fakeAsync(() => {
      const tableSetting: IPsTableSetting = {
        columnBlacklist: ['prop_b'],
        pageSize: 10,
        sortColumn: 'prop_a',
        sortDirection: 'desc',
      };
      const settingsService = new PsTableSettingsService();
      const component = new PsTableSettingsComponent(settingsService);
      component.tableId = 'table.1';
      spyOn(settingsService, 'getStream').and.returnValue(of(tableSetting));
      component.ngOnInit();

      let asyncSettings: IPsTableSetting;
      component.settings$.subscribe((settings) => {
        asyncSettings = settings;
      });

      expect(asyncSettings).toEqual(tableSetting);
      expect(settingsService.getStream).toHaveBeenCalledWith('table.1', true);
    }));

    it("should use default settings if service doesn't return settings", fakeAsync(() => {
      const settingsService = new PsTableSettingsService();
      const component = new PsTableSettingsComponent(settingsService);
      component.tableId = 'table.1';
      component.ngOnInit();

      let asyncSettings: IPsTableSetting;
      component.settings$.subscribe((settings) => {
        asyncSettings = settings;
      });

      expect(asyncSettings).toEqual({
        columnBlacklist: [],
        pageSize: 15,
        sortColumn: null,
        sortDirection: 'asc',
      });
    }));

    it('columnVisible should return false for blacklisted columns', fakeAsync(() => {
      const settingsService = new PsTableSettingsService();
      const component = new PsTableSettingsComponent(settingsService);
      function createSettings(blacklist: string[]): IPsTableSetting {
        return ({
          columnBlacklist: blacklist,
        } as Partial<IPsTableSetting>) as any;
      }
      function createColumnDef(propName: string): PsTableColumnDirective {
        return ({
          property: propName,
        } as Partial<IPsTableSetting>) as any;
      }
      expect(component.columnVisible(createSettings(['prop']), createColumnDef('prop'))).toEqual(false);
      expect(component.columnVisible(createSettings(['a']), createColumnDef('prop'))).toEqual(true);
      expect(component.columnVisible(createSettings([]), createColumnDef('prop'))).toEqual(true);
    }));

    describe('onSortChanged', () => {
      const settingsService = new PsTableSettingsService();
      const component = new PsTableSettingsComponent(settingsService);
      function createSettings(blacklist: string[], sortColumn: string, sortDirection: 'asc' | 'desc'): IPsTableSetting {
        return ({
          columnBlacklist: blacklist,
          sortColumn: sortColumn,
          sortDirection: sortDirection,
        } as Partial<IPsTableSetting>) as any;
      }
      function createColumnDef(sortColumn: string, sortDirection: 'asc' | 'desc') {
        return { sortColumn: sortColumn, sortDirection: sortDirection };
      }

      it('should remove sort column from blacklist', fakeAsync(() => {
        const settings = createSettings(['prop_1', 'prop_2'], 'prop', 'desc');
        component.onSortChanged(createColumnDef('prop_2', 'desc'), settings);
        expect(settings as any).toEqual({
          columnBlacklist: ['prop_1'],
          sortColumn: 'prop_2',
          sortDirection: 'desc',
        });
      }));

      it('should set sortColumn and sortDirection', fakeAsync(() => {
        const settings = createSettings([], 'prop', 'desc');
        component.onSortChanged(createColumnDef('prop_2', 'asc'), settings);
        expect(settings as any).toEqual({
          columnBlacklist: [],
          sortColumn: 'prop_2',
          sortDirection: 'asc',
        });
      }));
    });

    it('onColumnVisibilityChange should toggle column in blacklist', fakeAsync(() => {
      const settingsService = new PsTableSettingsService();
      const component = new PsTableSettingsComponent(settingsService);

      const settings: IPsTableSetting = {
        columnBlacklist: [],
      } as any;
      const columnDef: PsTableColumnDirective = {
        property: '',
      } as any;
      const event = new MatCheckboxChange();

      columnDef.property = 'prop';
      event.checked = false;
      component.onColumnVisibilityChange(event, settings, columnDef);
      expect(settings.columnBlacklist).toEqual(['prop']);

      columnDef.property = 'prop2';
      event.checked = false;
      component.onColumnVisibilityChange(event, settings, columnDef);
      expect(settings.columnBlacklist).toEqual(['prop', 'prop2']);

      columnDef.property = 'prop';
      event.checked = true;
      component.onColumnVisibilityChange(event, settings, columnDef);
      expect(settings.columnBlacklist).toEqual(['prop2']);

      columnDef.property = 'prop';
      event.checked = true;
      component.onColumnVisibilityChange(event, settings, columnDef);
      expect(settings.columnBlacklist).toEqual(['prop2']);
    }));
  });
});
