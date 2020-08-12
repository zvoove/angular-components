import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultPsSelectDataSource, PsSelectLoadTrigger, PsSelectSortBy } from '@prosoft/components/select';
import { NEVER, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

declare type DemoDataSourceItems = 'default' | 'error' | 'loading' | 'empty';

interface DemoLogs {
  loadCount: number;
}

@Component({
  selector: 'app-select-demo',
  template: `
    <div class="app-select-demo__settings">
      <mat-card class="app-select-demo__settings-box">
        <strong>ps-select</strong>
        <span>[dataSource] = new DefaultPsSelectDataSource(...)</span>
        <mat-checkbox [(ngModel)]="multiple" (change)="recreate()">[multiple]</mat-checkbox>
        <mat-checkbox [(ngModel)]="clearable">[clearable]</mat-checkbox>
        <mat-checkbox [(ngModel)]="disabled" (change)="disabledChanged()">[disabled]</mat-checkbox>
        <mat-checkbox [(ngModel)]="required">[required]</mat-checkbox>
        <span>[errorStateMatcher]</span>
        <mat-checkbox [(ngModel)]="panelClass">[panelClass] (color: green)</mat-checkbox>

        <div>(openedChange) $event = boolean</div>
        <div>(selectionChange) $event = MatSelectChange</div>

        <mat-checkbox [(ngModel)]="customTriggerTpl">*psSelectTriggerTemplate="let item"</mat-checkbox>
        <mat-checkbox [(ngModel)]="customOptionTpl">*psSelectOptionTemplate="let item"</mat-checkbox>
      </mat-card>

      <mat-card class="app-select-demo__settings-box">
        <strong>DefaultPsSelectDataSource</strong>
        <mat-form-field>
          <mat-label>items</mat-label>
          <mat-select [(ngModel)]="dataSourceItems" (selectionChange)="resetDataSource()">
            <mat-option [value]="'default'">500 items</mat-option>
            <mat-option [value]="'error'">error while loading</mat-option>
            <mat-option [value]="'loading'">endless loading</mat-option>
            <mat-option [value]="'empty'">empty result</mat-option>
          </mat-select>
        </mat-form-field>

        <strong>items array</strong>
        <mat-checkbox [(ngModel)]="itemsAsObservable" (change)="resetDataSource()">wrapped in observable</mat-checkbox>
        <mat-checkbox [(ngModel)]="itemsAsFunction" (change)="resetDataSource()">result of load function</mat-checkbox>

        <mat-form-field>
          <mat-label>mode</mat-label>
          <mat-select [(ngModel)]="dataSourceMode" (selectionChange)="resetDataSource()">
            <mat-option [value]="'id'">id</mat-option>
            <mat-option [value]="'entity'">entity</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>idKey</mat-label>
          <mat-select [(ngModel)]="dataSourceIdKey" (selectionChange)="resetDataSource()">
            <mat-option [value]="'id'">id property</mat-option>
            <mat-option [value]="'strId'">strId property</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>labelKey</mat-label>
          <mat-select [(ngModel)]="dataSourceLabelKey" (selectionChange)="resetDataSource()">
            <mat-option [value]="'labelA'">labelA property</mat-option>
            <mat-option [value]="'labelB'">labelB property</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field>
          <mat-label>searchDebounce</mat-label>
          <input matInput type="number" [(ngModel)]="dataSourceSearchDebounce" (change)="resetDataSource()" />
        </mat-form-field>

        <strong>loadTrigger</strong>
        <mat-checkbox [(ngModel)]="loadTriggerInitial" (change)="resetDataSource()">Initial</mat-checkbox>
        <mat-checkbox [(ngModel)]="loadTriggerFirstPanelOpen" (change)="resetDataSource()">FirstPanelOpen</mat-checkbox>
        <mat-checkbox [(ngModel)]="loadTriggerEveryPanelOpen" (change)="resetDataSource()">EveryPanelOpen</mat-checkbox>

        <strong>sortBy</strong>
        <mat-checkbox [(ngModel)]="sortBySelected" (change)="resetDataSource()">Selected</mat-checkbox>
        <mat-checkbox [(ngModel)]="sortByComparer" (change)="resetDataSource()">Comparer</mat-checkbox>

        <strong>sortCompare</strong>
        <mat-checkbox [(ngModel)]="reverseSort" (change)="resetDataSource()">custom (reverse by id)</mat-checkbox>
      </mat-card>
    </div>

    <mat-card *ngIf="visible" style="margin-bottom: 1em;">
      <mat-form-field style="width: 100%;">
        <mat-label>ngModel</mat-label>
        <ps-select
          [(ngModel)]="ngModel"
          [dataSource]="ngModelDataSource"
          [multiple]="multiple"
          [clearable]="clearable"
          [disabled]="disabled"
          [required]="required"
          [panelClass]="{ 'app-select-demo__panel': panelClass }"
        >
          <ng-container *ngIf="customTriggerTpl">
            <ng-container *psSelectTriggerTemplate="let item">
              {{ item | json }}
            </ng-container>
          </ng-container>
          <ng-container *ngIf="customOptionTpl">
            <ng-container *psSelectOptionTemplate="let item">
              {{ item | json }}
            </ng-container>
          </ng-container>
        </ps-select>
      </mat-form-field>
      <div [formGroup]="form">
        <mat-form-field style="width: 100%;">
          <mat-label>FormControl</mat-label>
          <ps-select
            formControlName="ctrl"
            [dataSource]="formDataSource"
            [multiple]="multiple"
            [clearable]="clearable"
            [disabled]="disabled"
            [required]="required"
            [panelClass]="{ 'app-select-demo__panel': panelClass }"
          >
            <ng-container *ngIf="customTriggerTpl">
              <ng-container *psSelectTriggerTemplate="let item">
                {{ item | json }}
              </ng-container>
            </ng-container>
            <ng-container *ngIf="customOptionTpl">
              <ng-container *psSelectOptionTemplate="let item">
                {{ item | json }}
              </ng-container>
            </ng-container>
          </ps-select>
        </mat-form-field>
      </div>
    </mat-card>

    <mat-card style="margin-bottom: 1em;">
      <strong>ngModel logs</strong>
      <div>value: {{ ngModel | json }}</div>
      <div>load count: {{ ngModelLogs.loadCount }}</div>
    </mat-card>

    <mat-card style="margin-bottom: 1em;">
      <strong>FormControl logs</strong>
      <div>value: {{ form.value.ctrl | json }}</div>
      <div>load count: {{ formLogs.loadCount }}</div>
    </mat-card>

    <app-select-with-multiselect></app-select-with-multiselect>
    <app-select-with-events-only></app-select-with-events-only>
    <app-select-with-ng-model></app-select-with-ng-model>
    <app-select-with-selected-item-not-in-datasource></app-select-with-selected-item-not-in-datasource>
    <app-select-with-endless-loading-datasource></app-select-with-endless-loading-datasource>
    <app-select-with-error-in-datasource></app-select-with-error-in-datasource>
    <app-select-with-other-load-trigger></app-select-with-other-load-trigger>
    <app-select-with-custom-select-service></app-select-with-custom-select-service>
    <app-select-with-custom-template></app-select-with-custom-template>
    <app-select-with-error-state-matcher></app-select-with-error-state-matcher>
  `,
  styles: [
    `
      .app-select-demo__settings {
        display: grid !important;
        grid-auto-flow: column;
        gap: 1em;

        margin-bottom: 1em;
      }
      .app-select-demo__settings-box {
        display: grid !important;
        gap: 1em;
        align-content: start;
      }
      .app-select-demo__panel .mat-option-text {
        color: green;
      }
    `,
  ],
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
  public ngModelDataSource: DefaultPsSelectDataSource;
  public formDataSource: DefaultPsSelectDataSource;
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
    const ds = new DefaultPsSelectDataSource({
      mode: this.dataSourceMode,
      idKey: this.dataSourceIdKey,
      labelKey: this.dataSourceLabelKey,
      disabledKey: 'disabled',
      items: this.getDataSourceItems(logs),
      searchDebounce: this.dataSourceSearchDebounce,
      loadTrigger: this.getPsSelectLoadTrigger(),
      sortBy: this.getPsSelectSortBy(),
    });
    if (this.reverseSort) {
      ds.sortCompare = (a, b) => b.entity.id - a.entity.id;
    }
    return ds;
  }

  public getPsSelectLoadTrigger() {
    return (
      // tslint:disable-next-line: no-bitwise
      (this.loadTriggerInitial && PsSelectLoadTrigger.Initial) |
      (this.loadTriggerFirstPanelOpen && PsSelectLoadTrigger.FirstPanelOpen) |
      (this.loadTriggerEveryPanelOpen && PsSelectLoadTrigger.EveryPanelOpen)
    );
  }

  public getPsSelectSortBy() {
    // tslint:disable-next-line: no-bitwise
    return (this.sortBySelected && PsSelectSortBy.Selected) | (this.sortByComparer && PsSelectSortBy.Comparer);
  }

  public getDataSourceItems(logs: DemoLogs) {
    logs.loadCount = 0;
    switch (this.dataSourceItems) {
      case 'default':
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
      case 'empty':
        return [];
      case 'loading':
        return NEVER;
      case 'error':
        return throwError(new Error('loading failed'));
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
