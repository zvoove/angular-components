import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardActions, MatCardModule } from '@angular/material/card';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ZvTableColumnDirective } from '../directives/table.directives';
import { IZvTableSortDefinition } from '../models';
import { IZvTableSetting, ZvTableSettingsService } from '../services/table-settings.service';
import { ZvTableSettingsComponent } from './table-settings.component';
import { ZvTableSortComponent } from './table-sort.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-settings
      [tableId]="tableId"
      [columnDefinitions]="columnDefinitions"
      [sortDefinitions]="sortDefinitions"
      [pageSizeOptions]="pageSizeOptions"
      (settingsSaved)="onSettingsSaved($event)"
      (settingsAborted)="onSettingsAborted($event)"
    ></zv-table-settings>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestComponent {
  public tableId: string;
  public columnDefinitions: ZvTableColumnDirective[] = [];
  public sortDefinitions: IZvTableSortDefinition[] = [];
  public pageSizeOptions: number[] = [1, 3, 7];

  @ViewChild(ZvTableSettingsComponent, { static: true }) tableSearch: ZvTableSettingsComponent;

  public onSettingsSaved() {}
  public onSettingsAborted() {}
}

describe('ZvTableSettingsComponent', () => {
  describe('integration', () => {
    beforeEach(waitForAsync(() => {
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
        declarations: [TestComponent, ZvTableSettingsComponent, ZvTableSortComponent],
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

      const settings: IZvTableSetting = {
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

    it('should not loose custom setting properties', fakeAsync(() => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;

      const settings: any = {
        columnBlacklist: ['prop_b'],
        pageSize: 11,
        sortColumn: 'prop_a',
        sortDirection: 'desc',
        customProperty: 'custom value',
      };
      component.tableId = 'tableA';
      component.tableSearch.settingsService.getStream = () => of(settings);
      fixture.detectChanges();

      spyOn(component.tableSearch.settingsService, 'save').and.returnValue(of(null));

      const [saveButton] = fixture.debugElement.query(By.directive(MatCardActions)).queryAll(By.directive(MatButton));
      saveButton.triggerEventHandler('click', null);

      expect(component.tableSearch.settingsService.save).toHaveBeenCalledWith('tableA', settings);
    }));
  });

  describe('isolated', () => {
    it('should get settings from the service by tableId', fakeAsync(() => {
      const tableSetting: IZvTableSetting = {
        columnBlacklist: ['prop_b'],
        pageSize: 10,
        sortColumn: 'prop_a',
        sortDirection: 'desc',
      };
      const settingsService = new ZvTableSettingsService();
      const component = new ZvTableSettingsComponent(settingsService);
      component.tableId = 'table.1';
      spyOn(settingsService, 'getStream').and.returnValue(of(tableSetting));
      component.ngOnInit();

      let asyncSettings: IZvTableSetting;
      component.settings$.subscribe((settings) => {
        asyncSettings = settings;
      });

      expect(asyncSettings).toEqual(tableSetting);
      expect(settingsService.getStream).toHaveBeenCalledWith('table.1', true);
    }));

    it("should use default settings if service doesn't return settings", fakeAsync(() => {
      const settingsService = new ZvTableSettingsService();
      const component = new ZvTableSettingsComponent(settingsService);
      component.tableId = 'table.1';
      component.ngOnInit();

      let asyncSettings: IZvTableSetting;
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
      const settingsService = new ZvTableSettingsService();
      const component = new ZvTableSettingsComponent(settingsService);
      function createSettings(blacklist: string[]): IZvTableSetting {
        return {
          columnBlacklist: blacklist,
        } as Partial<IZvTableSetting> as any;
      }
      function createColumnDef(propName: string): ZvTableColumnDirective {
        return {
          property: propName,
        } as Partial<IZvTableSetting> as any;
      }
      expect(component.columnVisible(createSettings(['prop']), createColumnDef('prop'))).toEqual(false);
      expect(component.columnVisible(createSettings(['a']), createColumnDef('prop'))).toEqual(true);
      expect(component.columnVisible(createSettings([]), createColumnDef('prop'))).toEqual(true);
    }));

    describe('onSortChanged', () => {
      const settingsService = new ZvTableSettingsService();
      const component = new ZvTableSettingsComponent(settingsService);
      function createSettings(blacklist: string[], sortColumn: string, sortDirection: 'asc' | 'desc'): IZvTableSetting {
        return {
          columnBlacklist: blacklist,
          sortColumn: sortColumn,
          sortDirection: sortDirection,
        } as Partial<IZvTableSetting> as any;
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
      const settingsService = new ZvTableSettingsService();
      const component = new ZvTableSettingsComponent(settingsService);

      const settings: IZvTableSetting = {
        columnBlacklist: [],
      } as any;
      const columnDef: ZvTableColumnDirective = {
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
