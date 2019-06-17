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
  ViewChildren,
  ViewEncapsulation,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, FormControl, NgControl } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { getSelectUnknownDataSourceError } from './errors';
import { isPsSelectDataSource, PsSelectDataSource, PsSelectItem } from './select.models';
import { PsSelectService } from './select.service';

@Component({
  selector: 'ps-select-data',
  template: `
    <mat-option>
      <ngx-mat-select-search [formControl]="filterCtrl" [searching]="loading"></ngx-mat-select-search>
    </mat-option>
    <mat-option *ngIf="showEmptyInput">
      --
    </mat-option>
    <mat-option *ngIf="hasError" [disabled]="true" class="ps-select-data__error">
      <span class="ps-select-data__error-message">{{ errorMessage }}</span>
    </mat-option>
    <mat-option *ngFor="let item of items; trackBy: trackByOptions" [value]="item.value" [class.ps-option-hidden]="item.hidden">
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

  /** Gibt an, ob im singleselect Modus eine leere Option auswählbar sein soll */
  @Input() public clearable = true;

  @Input() public optionTemplate: TemplateRef<any> | null = null;

  /** Die MatOptions für MatSelect */
  @ViewChildren(MatOption) public options: QueryList<MatOption>;

  /** FormControl for the search filter */
  public filterCtrl = new FormControl('');

  /** Die anzuzeigenden Items */
  public items: PsSelectItem<T>[] | ReadonlyArray<PsSelectItem<T>> = [];

  /** Gibt an, ob die Items gerade geladen werden */
  public get loading() {
    return this.dataSource && this.dataSource.loading;
  }

  /** Gibt an, ob es beim Items Laden einen Fehler gab */
  public get hasError() {
    return this.dataSource && !!this.dataSource.error;
  }

  /** Die Fehlernachricht, wenn es beim Items Laden einen Fehler gab */
  public get errorMessage() {
    return this.dataSource && this.dataSource.errorMessage;
  }

  /** Gibt an, ob der multiselect Modus aktiv ist */
  public get multiple() {
    return this.select && this.select.multiple;
  }

  /** Gibt an, ob die MatOption ohne value (zum Auswahl Löschen) angezeigt werden soll. */
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
    // MatOptions weiter reichen
    this.options.changes
      .pipe(
        startWith(null),
        takeUntil(this._ngUnsubscribe$)
      )
      .subscribe(() => {
        const options = this.options.toArray();
        this.select.options.reset(options);
        this.select.options.notifyOnChanges();
      });

    // panel open/close, filter und selectedValue an DataSource weiter geben
    this.select.openedChange.pipe(takeUntil(this._ngUnsubscribe$)).subscribe(open => this.dataSource.panelOpenChanged(open));
    this.filterCtrl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe(searchText => this.dataSource.searchTextChanged(searchText));
    this.select.ngControl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe(value => this._pushSelectedValuesToDataSource(value));
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
    return item.value;
  }

  private _updateCompareWithBindings() {
    if (!this.dataSource) {
      return;
    }

    // compareWith angegeben -> mat select und datasource updaten
    if (this._compareWith) {
      this._dataSource.compareWith = this._compareWith;
      this.select.compareWith = this._compareWith;
    }
    // keine angegeben, aber datasource hat eine default -> select updaten
    else if (this._dataSource.compareWith) {
      this.select.compareWith = this._dataSource.compareWith;
    }
    // keine angegeben und datasource hat keine default -> datasource updaten
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
