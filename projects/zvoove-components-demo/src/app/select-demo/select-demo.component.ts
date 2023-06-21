import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultZvSelectDataSource, ZvSelectLoadTrigger, ZvSelectSortBy } from '@zvoove/components/select';
import { NEVER, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

declare type DemoDataSourceItems = 'default' | 'error' | 'loading' | 'empty';

interface DemoLogs {
  loadCount: number;
}

@Component({
  selector: 'app-select-demo',
  templateUrl: './select-demo.component.html',
  styleUrls: ['./select-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SelectDemoComponent implements OnInit {
  public visible = true;
  public ngModel: any = null;
  public form = new FormGroup({
    ctrl: new FormControl(null),
  });
  public items = Array.from(Array(500).keys()).map((i) => ({
    id: i,
    strId: `id${i}`,
    labelA: `Label A ${i}`,
    labelB: `Label B ${i}`,
    disabled: i % 5 === 4,
  }));
  public unknowIitem = {
    id: -1,
    strId: `id-1`,
    labelA: `Label A -1`,
    labelB: `Label B -1`,
  };
  public ngModelDataSource: DefaultZvSelectDataSource;
  public formDataSource: DefaultZvSelectDataSource;
  public multiple = false;
  public clearable = true;
  public disabled = false;
  public required = false;
  public panelClass = false;

  public customTriggerTpl = false;
  public customOptionTpl = false;

  public dataSourceItems: DemoDataSourceItems = 'default';
  public dataSourceMode: 'id' | 'entity' = 'id';
  public dataSourceIdKey = 'id';
  public dataSourceLabelKey = 'labelA';
  public dataSourceSearchDebounce = 300;

  public loadTriggerInitial = true;
  public loadTriggerFirstPanelOpen = false;
  public loadTriggerEveryPanelOpen = false;

  public sortBySelected = true;
  public sortByComparer = true;
  public reverseSort = false;

  public itemsAsObservable = false;
  public itemsAsFunction = false;

  public ngModelLogs: DemoLogs = { loadCount: 0 };
  public formLogs: DemoLogs = { loadCount: 0 };

  constructor(private cd: ChangeDetectorRef) {}

  public ngOnInit() {
    this.resetDataSource();
  }

  public createDataSource(logs: DemoLogs) {
    const ds = new DefaultZvSelectDataSource({
      mode: this.dataSourceMode,
      idKey: this.dataSourceIdKey,
      labelKey: this.dataSourceLabelKey,
      disabledKey: 'disabled',
      items: this.getDataSourceItems(logs),
      searchDebounce: this.dataSourceSearchDebounce,
      loadTrigger: this.getZvSelectLoadTrigger(),
      sortBy: this.getZvSelectSortBy(),
    });
    if (this.reverseSort) {
      ds.sortCompare = (a, b) => b.entity.id - a.entity.id;
    }
    return ds;
  }

  public getZvSelectLoadTrigger() {
    return (
      // eslint-disable-next-line no-bitwise
      (this.loadTriggerInitial && ZvSelectLoadTrigger.initial) |
      (this.loadTriggerFirstPanelOpen && ZvSelectLoadTrigger.firstPanelOpen) |
      (this.loadTriggerEveryPanelOpen && ZvSelectLoadTrigger.everyPanelOpen)
    );
  }

  public getZvSelectSortBy() {
    // eslint-disable-next-line no-bitwise
    return (this.sortBySelected && ZvSelectSortBy.selected) | (this.sortByComparer && ZvSelectSortBy.comparer);
  }

  public getDataSourceItems(logs: DemoLogs) {
    logs.loadCount = 0;
    switch (this.dataSourceItems) {
      case 'default': {
        let items: any = this.items;
        if (this.itemsAsObservable) {
          items = of(items).pipe(
            tap(() => {
              ++logs.loadCount;
            }),
            delay(1000)
          );
        }
        if (this.itemsAsFunction) {
          const originalItems = items;
          items = () => {
            ++logs.loadCount;
            return originalItems;
          };
        }
        return items;
      }
      case 'empty':
        return [];
      case 'loading':
        return NEVER;
      case 'error':
        return throwError(() => new Error('loading failed'));
    }
  }

  public resetDataSource() {
    this.ngModelDataSource = this.createDataSource(this.ngModelLogs);
    this.formDataSource = this.createDataSource(this.formLogs);
  }

  public patchUnknownItem() {
    const item = this.multiple ? [this.unknowIitem] : this.unknowIitem;
    this.ngModel = item;
    this.form.patchValue({ ctrl: item });
  }

  public disabledChanged() {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  public recreate() {
    this.visible = false;
    setTimeout(() => {
      this.resetDataSource();
      this.visible = true;
      this.cd.markForCheck();
    }, 0);
  }
}
