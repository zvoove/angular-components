import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DoCheck,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  signal,
  inject,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroupDirective, FormsModule, NgControl, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { ErrorStateMatcher, MatOption, _ErrorStateTracker } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { ZvErrorMessagePipe } from '@zvoove/components/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { DEFAULT_COMPARER, ZvSelectDataSource, isZvSelectDataSource } from './data/select-data-source';
import { ZvSelectOptionTemplate } from './directives/select-option-template.directive';
import { ZvSelectTriggerTemplate } from './directives/select-trigger-template.directive';
import { getSelectUnknownDataSourceError } from './helpers/errors';
import { ZvSelectItem, ZvSelectTriggerData } from './models';
import { ZvSelectService } from './services/select.service';

const enum ValueChangeSource {
  matSelect = 1,
  toggleAll = 2,
  valueInput = 3,
  writeValue = 4,
}

@Component({
  selector: 'zv-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.zv-select-multiple]': 'multiple',
    '[class.zv-select-disabled]': 'disabled',
    '[class.zv-select-invalid]': 'errorState',
    '[class.zv-select-required]': 'required',
    '[class.zv-select-empty]': 'empty',
    class: 'zv-select',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvSelect }],
  imports: [
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatSelect,
    ReactiveFormsModule,
    FormsModule,
    MatSelectTrigger,
    NgTemplateOutlet,
    MatOption,
    NgxMatSelectSearchModule,
    ZvErrorMessagePipe,
  ],
})
export class ZvSelect<T = unknown> implements ControlValueAccessor, MatFormFieldControl<T>, DoCheck, OnInit, OnDestroy {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly selectService = inject(ZvSelectService, { optional: true });
  public readonly ngControl = inject(NgControl, { optional: true, self: true });

  public static nextId = 0;
  @HostBinding() public id = `zv-select-${ZvSelect.nextId++}`;

  @ContentChild(ZvSelectOptionTemplate, { read: TemplateRef })
  public optionTemplate: TemplateRef<unknown> | null = null;

  @ContentChild(ZvSelectTriggerTemplate)
  public customTrigger: ZvSelectTriggerTemplate | null = null;

  public get triggerTemplate(): TemplateRef<unknown> | null {
    return this.customTrigger?.templateRef ?? null;
  }

  @ViewChild(MatSelect, { static: true }) public set setMatSelect(select: MatSelect) {
    this._matSelect = select;

    // MatSelect doesn't trigger stateChanges on close which causes problems, so we patch it here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const close = select.close;
    select.close = () => {
      close.call(select);
      select.stateChanges.next();
    };
  }

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
  @Input({ required: true })
  get dataSource(): any {
    return this._dataSourceInstance;
  }
  set dataSource(dataSource: any) {
    if (this._dataSourceInput !== dataSource) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this._dataSourceInput = dataSource;
      this._switchDataSource(dataSource);
    }
  }

  @Input()
  public get value(): T | null {
    return this._value;
  }
  public set value(value: T | null) {
    this._propagateValueChange(value, ValueChangeSource.valueInput);
  }
  private _value: T | null = null;

  /** If true, then there will be a empty option available to deselect any values (only single select mode) */
  @Input() public clearable = true;
  /** If true, then there will be a toggle all checkbox available (only multiple select mode) */
  @Input() public showToggleAll = true;
  @Input() public multiple = false;
  @Input() public panelClass: string | string[] | Set<string> | Record<string, any> = '';
  @Input() public placeholder = '';
  @Input() public required = false;
  @Input() public selectedLabel = true;

  /**
   * Event that emits whenever the raw value of the select changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   *
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<T | null> = new EventEmitter<T | null>();
  @Output() public readonly openedChange = new EventEmitter<boolean>();
  @Output() public readonly selectionChange = new EventEmitter<MatSelectChange>();

  public empty = true;

  public get shouldLabelFloat() {
    return !this.empty;
  }

  public get focused() {
    const matFocus = this._matSelect.focused;
    if (matFocus != null) {
      return this._focused || matFocus;
    }
    return this._focused;
  }

  @Input({ transform: booleanAttribute })
  public disabled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly stateChanges: Subject<void> = new Subject<void>();

  @Input()
  get errorStateMatcher() {
    return this._errorStateTracker.matcher;
  }
  set errorStateMatcher(value: ErrorStateMatcher) {
    this._errorStateTracker.matcher = value;
  }

  /** Whether the input is in an error state. */
  get errorState() {
    return this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  public get compareWith(): (o1: any, o2: any) => boolean {
    return this._dataSourceInstance?.compareWith ?? DEFAULT_COMPARER;
  }

  public readonly controlType = 'zv-select';

  /** FormControl for the search filter */
  public filterCtrl = new FormControl('', { nonNullable: true });

  /** The items to display */
  public items: ZvSelectItem<T>[] | readonly ZvSelectItem<T>[] = [];

  public toggleAllCheckboxChecked = false;
  public toggleAllCheckboxIndeterminate = false;

  /** true while the options are loading */
  public get loading(): boolean {
    return !!this._dataSourceInstance?.loading;
  }

  /** true when there was an error while loading the options */
  public get hasError(): boolean {
    return !!this.error;
  }

  /** the error that occured while loading the options */
  public get error() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._dataSourceInstance?.error;
  }

  /** If true, then the empty option should be shown. */
  public get showEmptyInput() {
    if (this.multiple || !this.clearable || !this.items?.length) {
      return false;
    }
    const searchText = (this.filterCtrl.value || '').toLowerCase();
    return !searchText || '--'.indexOf(searchText) > -1;
  }

  public get tooltip(): string {
    // MatSelect is not fully initialized in the beginning, so we need to skip this here until it is ready
    if (this.multiple && this._matSelect?._selectionModel && this._matSelect.selected) {
      return (this._matSelect.selected as MatOption[]).map((x) => x.viewValue).join(', ');
    }
    return '';
  }

  readonly $currentSelection = signal([] as MatOption<any>[]);
  readonly $customTriggerDataArray = computed(() => {
    const selectedOptions = this.$currentSelection().map((option: MatOption): ZvSelectTriggerData => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: option.value,
        viewValue: option.viewValue,
      };
    });
    return this._matSelect._isRtl() ? selectedOptions.reverse() : selectedOptions;
  });
  /** The value displayed in the trigger. */
  readonly $customTriggerData = computed(() => {
    if (this.multiple) {
      return this.$customTriggerDataArray();
    }
    return this.$customTriggerDataArray()[0];
  });
  readonly $selectedItemsTriggerLabel = computed(() => {
    if (this.empty) return '';
    return this.$customTriggerDataArray()
      .map((x) => x.viewValue)
      .join(', ');
  });

  /** Subject that emits when the component has been destroyed. */
  private _ngUnsubscribe$ = new Subject<void>();
  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription = Subscription.EMPTY;
  /** The data source. */
  private _dataSourceInstance!: ZvSelectDataSource<T>;
  /** The value the [dataSource] input was called with. */
  private _dataSourceInput: any;
  private _matSelect!: MatSelect;
  private _onModelTouched: any;
  private _focused = false;
  private _onInitCalled = false;
  _errorStateTracker: _ErrorStateTracker;

  /** View -> model callback called when value changes */
  private _onChange: (value: any) => void = () => {};

  constructor() {
    const defaultErrorStateMatcher = inject(ErrorStateMatcher);
    const parentForm = inject(NgForm, { optional: true });
    const parentFormGroup = inject(FormGroupDirective, { optional: true });
    const ngControl = this.ngControl;

    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    this._errorStateTracker = new _ErrorStateTracker(defaultErrorStateMatcher, ngControl, parentFormGroup, parentForm, this.stateChanges);
  }

  public ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  /** Refreshes the error state of the input. */
  updateErrorState() {
    this._errorStateTracker.updateErrorState();
  }

  public ngOnInit() {
    this._onInitCalled = true;

    // before oninit ngControl.control isn't set, but it is needed for datasource creation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this._switchDataSource(this._dataSourceInput);

    this.filterCtrl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      .subscribe((searchText) => this.dataSource.searchTextChanged(searchText));

    let selectionSignalInitialized = false;
    this._matSelect.stateChanges
      .pipe(
        tap(() => {
          if (!selectionSignalInitialized && this._matSelect._selectionModel) {
            this.$currentSelection.set(this._matSelect._selectionModel.selected);
            this._matSelect._selectionModel.changed.pipe(takeUntil(this._ngUnsubscribe$)).subscribe(() => {
              this.$currentSelection.set(this._matSelect._selectionModel.selected);
            });
            selectionSignalInitialized = true;
          }
        }),
        takeUntil(this._ngUnsubscribe$)
      )
      .subscribe(this.stateChanges);
  }

  public ngOnDestroy() {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
    this.viewChange.complete();
    this._renderChangeSubscription.unsubscribe();
  }

  public onContainerClick(_: MouseEvent): void {
    this._matSelect.onContainerClick();
  }

  public setDescribedByIds(ids: string[]): void {
    this._matSelect.setDescribedByIds(ids);
  }

  public writeValue(value: any) {
    this._propagateValueChange(value, ValueChangeSource.writeValue);
  }

  public registerOnChange(fn: () => void) {
    this._onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._onModelTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public onSelectionChange(event: MatSelectChange) {
    this._updateToggleAllCheckbox();
    this.selectionChange.emit(event);
  }

  public onOpenedChange(open: boolean) {
    this._onFocusChanged(open);
    this.openedChange.emit(open);
    this._dataSourceInstance.panelOpenChanged(open);
  }

  public onValueChange(value: any) {
    this._propagateValueChange(value, ValueChangeSource.matSelect);
  }

  public onToggleAll(state: boolean) {
    const newValue = state ? (this.items as ZvSelectItem<T>[]).map((x) => x.value) : [];
    this._propagateValueChange(newValue, ValueChangeSource.toggleAll);
  }

  public trackByOptions(_: number, item: ZvSelectItem<T>) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `${item.value}#${item.label}`;
  }

  public reloadAfterError() {
    this._dataSourceInstance.forceReload();
  }

  private _propagateValueChange(value: any, source: ValueChangeSource) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._value = value;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.empty = this.multiple ? !value?.length : value == null || value === '';
    this._updateToggleAllCheckbox();
    this._pushSelectedValuesToDataSource(value);
    if (source !== ValueChangeSource.valueInput) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.valueChange.emit(value);
    }
    if (source !== ValueChangeSource.writeValue) {
      this._onChange(value);
    }
    this.cd.markForCheck();
  }

  private _pushSelectedValuesToDataSource(value: any): void {
    if (!this._dataSourceInstance) {
      return;
    }
    let values: any[];
    if (this.multiple) {
      values = Array.isArray(value) ? value : [];
    } else {
      values = value ? [value] : [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this._dataSourceInstance.selectedValuesChanged(values);
  }

  /** Set up a subscription for the data provided by the data source. */
  private _switchDataSource(dataSource: any) {
    if (!this._onInitCalled) {
      // before oninit ngControl.control isn't set, but it is needed for datasource creation
      return;
    }

    // Stop listening for data from the previous data source.
    this._dataSourceInstance?.disconnect();
    this._renderChangeSubscription.unsubscribe();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._dataSourceInstance = this.selectService?.createDataSource(dataSource, this.ngControl?.control ?? null) ?? dataSource;
    if (!isZvSelectDataSource(this._dataSourceInstance)) {
      throw getSelectUnknownDataSourceError();
    }

    this._dataSourceInstance.searchTextChanged(this.filterCtrl.value);
    this._dataSourceInstance.panelOpenChanged(this._matSelect.panelOpen);
    this._pushSelectedValuesToDataSource(this._value);

    this._renderChangeSubscription = this._dataSourceInstance.connect().subscribe((items) => {
      this.items = items || [];
      this._updateToggleAllCheckbox();
      this.cd.markForCheck();
    });
  }

  private _updateToggleAllCheckbox() {
    if (this.multiple && this.items && Array.isArray(this._value)) {
      const selectedValueCount = this._value.length;
      this.toggleAllCheckboxChecked = this.items.length === selectedValueCount;
      this.toggleAllCheckboxIndeterminate = selectedValueCount > 0 && selectedValueCount < this.items.length;
    }
  }

  /** Callback for the cases where the focused state of the input changes. */
  private _onFocusChanged(isFocused: boolean) {
    if (isFocused !== this.focused) {
      this._focused = isFocused;
      this.stateChanges.next();
    }
    if (!isFocused && this._onModelTouched != null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this._onModelTouched();
    }
  }
}
