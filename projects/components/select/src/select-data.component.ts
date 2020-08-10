import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Inject,
  Input,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormControl, NgControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { getSelectUnknownDataSourceError } from './errors';
import { PsSelectItem } from './models';
import { isPsSelectDataSource, PsSelectDataSource } from './select-data-source';
import { PsSelectService } from './select.service';

import type { QueryList } from '@angular/core';

@Component({
  selector: 'ps-select-data',
  template: `
    <mat-option class="ps-select-data__search">
      <ngx-mat-select-search
        [formControl]="filterCtrl"
        [searching]="loading"
        [showToggleAllCheckbox]="showToggleAll"
        [toggleAllCheckboxChecked]="toggleAllCheckboxChecked"
        [toggleAllCheckboxIndeterminate]="toggleAllCheckboxIndeterminate"
        (toggleAll)="onToggleAll($event)"
      ></ngx-mat-select-search>
    </mat-option>
    <mat-option *ngIf="showEmptyInput" class="ps-select-data__empty-option">
      --
    </mat-option>
    <mat-option *ngIf="hasError" [disabled]="true" class="ps-select-data__error">
      <span class="ps-select-data__error-message">{{ error | psErrorMessage }}</span>
    </mat-option>
    <mat-option
      *ngFor="let item of items; trackBy: trackByOptions"
      [value]="item.value"
      [class.ps-option-hidden]="item.hidden"
      [disabled]="item.disabled"
      class="ps-select-data__option"
    >
      <ng-container *ngIf="!optionTemplate">
        {{ item.label }}
      </ng-container>
      <ng-template *ngIf="optionTemplate" [ngTemplateOutlet]="optionTemplate" [ngTemplateOutletContext]="{ $implicit: item }">
      </ng-template>
    </mat-option>
  `,
  styles: [
    `
      .ps-option-hidden {
        display: none !important;
      }
      .ps-select-data__error-message {
        color: red;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsSelectDataComponent<T = any> implements AfterViewInit, OnDestroy {
  /**
   * Stream containing the latest information on what rows are being displayed on screen.
   * Can be used by the data source to as a heuristic of what data should be provided.
   */
  public viewChange = new BehaviorSubject<{ start: number; end: number }>({ start: 0, end: Number.MAX_VALUE });

  /**
   * The selects's source of data, which can be provided in three ways (in order of complexity):
   *   - Simple data array (each object represents one select option)
   *   - Stream that emits a data array each time the array changes
   *   - `DataSource` object that implements the connect/disconnect interface.
   */
  @Input()
  get dataSource(): any {
    return this._dataSourceInstance;
  }
  set dataSource(dataSource: any) {
    if (this._dataSourceInput !== dataSource) {
      this._dataSourceInput = dataSource;
      this._switchDataSource(dataSource);
    }
  }

  @Input() public set compareWith(fn: (o1: any, o2: any) => boolean) {
    this._compareWith = fn;
    this._updateCompareWithBindings();
  }

  /** If true, then there will be a empty option available to deselect any values (only single select mode) */
  @Input() public clearable = true;

  /** If true, then there will be a toggle all checkbox available (only multiple select mode) */
  @Input() public showToggleAll = true;

  @Input() public optionTemplate: TemplateRef<any> | null = null;

  /** The MatOptions for MatSelect */
  @ViewChildren(MatOption) public options: QueryList<MatOption>;

  /** FormControl for the search filter */
  public filterCtrl = new FormControl('');

  /** The items to display */
  public items: PsSelectItem<T>[] | ReadonlyArray<PsSelectItem<T>> = [];

  public toggleAllCheckboxChecked = false;
  public toggleAllCheckboxIndeterminate = false;

  /** true while the options are loading */
  public get loading(): boolean {
    return !!this._dataSourceInstance?.loading;
  }

  /** true when there was an error while loading the options */
  public get hasError(): boolean {
    return !!this._dataSourceInstance?.error;
  }

  /** the error that occured while loading the options */
  public get error() {
    return this._dataSourceInstance?.error;
  }

  /** true if the ps-select is in multiple mode */
  public get multiple() {
    return !!this.select?.multiple;
  }

  /** If true, then the empty option should be shown. */
  public get showEmptyInput() {
    if (this.multiple || !this.clearable) {
      return false;
    }
    const searchText = (this.filterCtrl.value || '').toLowerCase();
    return !searchText || '--'.indexOf(searchText) > -1;
  }

  /** Subject that emits when the component has been destroyed. */
  private _ngUnsubscribe$ = new Subject<void>();

  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription: Subscription | null;

  /** The data source. */
  private _dataSourceInstance: PsSelectDataSource<T>;

  /** The value the [dataSource] input was called with. */
  private _dataSourceInput: any;

  /** The compareWith function set through the @Input() */
  private _compareWith: (o1: any, o2: any) => boolean;

  /** The AbstractControl that MatSelect is bound to. */
  private get control(): AbstractControl {
    return this.ngControl.control;
  }

  constructor(
    @Inject(MatSelect) private select: MatSelect,
    @Optional() @Host() public ngControl: NgControl,
    private selectService: PsSelectService,
    private cd: ChangeDetectorRef
  ) {}

  public ngAfterViewInit() {
    // forward MatOptions to MatSelect
    this.options.changes.pipe(startWith(null as any), takeUntil(this._ngUnsubscribe$)).subscribe(() => {
      const options = this.options.toArray();
      this.select.options.reset(options);
      this.select.options.notifyOnChanges();
    });

    // forward panel open/close, filter and selectedValue to the DataSource
    this.select.openedChange.pipe(takeUntil(this._ngUnsubscribe$)).subscribe((open) => this.dataSource.panelOpenChanged(open));
    this.filterCtrl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe((searchText) => this.dataSource.searchTextChanged(searchText));

    // Propagate value changes to the DataSource
    const origWriteValue = this.select.writeValue;
    this.select.writeValue = (value: any) => {
      origWriteValue.call(this.select, value);
      this._pushSelectedValuesToDataSource(this.select.value);
    };
    const origOnChange = this.select._onChange;
    this.select._onChange = (value: any) => {
      origOnChange(value);
      this._pushSelectedValuesToDataSource(value);
    };
    if (this.select.value) {
      this._pushSelectedValuesToDataSource(this.select.value);
    }
  }

  public ngOnDestroy() {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
    this.viewChange.complete();

    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
    }
  }

  public trackByOptions(_: number, item: PsSelectItem<T>) {
    return `${item.value}#${item.label}`;
  }

  public onToggleAll(state: boolean) {
    const newValue = state ? (this.items as PsSelectItem<T>[]).map((x) => x.value) : [];
    this.control.patchValue(newValue);
  }

  private _updateCompareWithBindings() {
    if (!this.dataSource) {
      return;
    }

    // compareWith set -> update MatSelect and datasource
    if (this._compareWith) {
      this._dataSourceInstance.compareWith = this._compareWith;
      this.select.compareWith = this._compareWith;
    }
    // compareWith not set, but datasource has one -> update MatSelect
    else if (this._dataSourceInstance.compareWith) {
      this.select.compareWith = this._dataSourceInstance.compareWith;
    }
    // compareWith not set and datasource doesn't have one -> update datasource with the one of MatSelect
    else {
      this._dataSourceInstance.compareWith = this.select.compareWith;
    }
  }

  private _pushSelectedValuesToDataSource(value: any): void {
    let values: any[];
    if (this.select.multiple) {
      values = Array.isArray(value) ? value : [];
    } else {
      values = value ? [value] : [];
    }
    this.dataSource.selectedValuesChanged(values);
    this._updateToggleAllCheckbox();
  }

  /** Set up a subscription for the data provided by the data source. */
  private _switchDataSource(dataSource: any) {
    if (isPsSelectDataSource(this.dataSource)) {
      this._dataSourceInstance.disconnect();
    }

    // Stop listening for data from the previous data source.
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    this._dataSourceInstance = this.selectService.createDataSource(dataSource, this.control);
    this._updateCompareWithBindings();
    this._dataSourceInstance.searchTextChanged(this.filterCtrl.value);
    this._pushSelectedValuesToDataSource(this.select.value);

    if (!isPsSelectDataSource(this._dataSourceInstance)) {
      throw getSelectUnknownDataSourceError();
    }

    this._renderChangeSubscription = this._dataSourceInstance
      .connect()
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe((items) => {
        this.items = items || [];
        this._updateToggleAllCheckbox();
        this.cd.markForCheck();
      });
  }

  private _updateToggleAllCheckbox() {
    if (this.select.multiple && this.items && this.select.value) {
      const selectedValueCount = this.select.value.length;
      this.toggleAllCheckboxChecked = this.items.length === selectedValueCount;
      this.toggleAllCheckboxIndeterminate = selectedValueCount > 0;
    }
  }
}
