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
  QueryList,
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

@Component({
  selector: 'ps-select-data',
  template: `
    <mat-option class="ps-select-data__search">
      <ngx-mat-select-search [formControl]="filterCtrl" [searching]="loading"></ngx-mat-select-search>
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
  get dataSource(): PsSelectDataSource<T> {
    return this._dataSource;
  }
  set dataSource(dataSource: PsSelectDataSource<T>) {
    if (this._dataSource !== dataSource) {
      this._switchDataSource(dataSource);
    }
  }

  @Input() public set compareWith(fn: (o1: any, o2: any) => boolean) {
    this._compareWith = fn;
    this._updateCompareWithBindings();
  }

  /** If true, then there will be a empty option available to deselect any values (only singel select mode) */
  @Input() public clearable = true;

  @Input() public optionTemplate: TemplateRef<any> | null = null;

  /** The MatOptions for MatSelect */
  @ViewChildren(MatOption) public options: QueryList<MatOption>;

  /** FormControl for the search filter */
  public filterCtrl = new FormControl('');

  /** The items to display */
  public items: PsSelectItem<T>[] | ReadonlyArray<PsSelectItem<T>> = [];

  /** true while the options are loading */
  public get loading() {
    return this.dataSource && this.dataSource.loading;
  }

  /** true when there was an error while loading the options */
  public get hasError() {
    return this.dataSource && !!this.dataSource.error;
  }

  /** the error that occured while loading the options */
  public get error() {
    return this.dataSource && this.dataSource.error;
  }

  /** true if the ps-select is in multiple mode */
  public get multiple() {
    return this.select && this.select.multiple;
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
  private _dataSource: PsSelectDataSource<T>;

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
    this.options.changes
      .pipe(
        startWith(null as any),
        takeUntil(this._ngUnsubscribe$)
      )
      .subscribe(() => {
        const options = this.options.toArray();
        this.select.options.reset(options);
        this.select.options.notifyOnChanges();
      });

    // forward panel open/close, filter and selectedValue to the DataSource
    this.select.openedChange.pipe(takeUntil(this._ngUnsubscribe$)).subscribe(open => this.dataSource.panelOpenChanged(open));
    this.filterCtrl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe(searchText => this.dataSource.searchTextChanged(searchText));

    const ngControl = this.select.ngControl;
    let valueChanges = ngControl.valueChanges;
    if (ngControl.value) {
      valueChanges = valueChanges.pipe(startWith(ngControl.value));
    }
    valueChanges.pipe(takeUntil(this._ngUnsubscribe$)).subscribe(value => this._pushSelectedValuesToDataSource(value));
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

  private _updateCompareWithBindings() {
    if (!this.dataSource) {
      return;
    }

    // compareWith set -> update MatSelect and datasource
    if (this._compareWith) {
      this._dataSource.compareWith = this._compareWith;
      this.select.compareWith = this._compareWith;
    }
    // compareWith not set, but datasource has one -> update MatSelect
    else if (this._dataSource.compareWith) {
      this.select.compareWith = this._dataSource.compareWith;
    }
    // compareWith not set and datasource doesn't have one -> update datasource with the one of MatSelect
    else {
      this._dataSource.compareWith = this.select.compareWith;
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
  }

  /** Set up a subscription for the data provided by the data source. */
  private _switchDataSource(dataSource: any) {
    if (isPsSelectDataSource(this.dataSource)) {
      this.dataSource.disconnect();
    }

    // Stop listening for data from the previous data source.
    if (this._renderChangeSubscription) {
      this._renderChangeSubscription.unsubscribe();
      this._renderChangeSubscription = null;
    }

    this._dataSource = this.selectService.createDataSource(dataSource, this.control);
    this._updateCompareWithBindings();
    this._dataSource.searchTextChanged(this.filterCtrl.value);
    this._pushSelectedValuesToDataSource(this.select.ngControl.value);

    if (!isPsSelectDataSource(this._dataSource)) {
      throw getSelectUnknownDataSourceError();
    }

    this._renderChangeSubscription = this.dataSource
      .connect()
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe(items => {
        this.items = items || [];
        this.cd.markForCheck();
      });
  }
}
