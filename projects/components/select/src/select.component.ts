/* eslint-disable @angular-eslint/no-input-rename -- Backing models retain existing public binding names via compatibility setters. */
/* eslint-disable @angular-eslint/prefer-signals -- Compatibility setters preserve data source and output behavior */
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  input,
  output,
  signal,
  inject,
  viewChild,
  model,
} from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, NgControl, NgForm, ReactiveFormsModule } from '@angular/forms';
import { FORM_FIELD, FormValueControl, Field } from '@angular/forms/signals';
import { LegacyChangeNotifier, connectLegacyControl, createRequiredDetector, signalErrorControlSnapshot } from '@zvoove/components/form-base';
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
import { ZvSelectData } from './defaults/default-select-service';
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
    '[id]': 'id',
    '[class.zv-select-multiple]': 'multiple()',
    '[class.zv-select-disabled]': 'isDisabled()',
    '[class.zv-select-invalid]': 'errorState',
    '[class.zv-select-required]': 'required()',
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
export class ZvSelect<T = unknown> implements FormValueControl<T | null>, MatFormFieldControl<T | null>, DoCheck, OnInit, OnDestroy {
  readonly labelledById = signal<string | null>(null);
  setLabelledById(id: string | null) {
    this.labelledById.set(id);
  }

  private readonly cd = inject(ChangeDetectorRef);
  private readonly selectService = inject(ZvSelectService, { optional: true });
  private readonly formField = inject(FORM_FIELD, { optional: true, self: true });
  public readonly ngControl = this.formField ? null : inject(NgControl, { optional: true, self: true });

  public static nextId = 0;
  public id = `zv-select-${ZvSelect.nextId++}`;

  public readonly optionTemplate = contentChild(ZvSelectOptionTemplate, { read: TemplateRef });
  public readonly customTrigger = contentChild(ZvSelectTriggerTemplate);

  public get triggerTemplate(): TemplateRef<unknown> | null {
    return this.customTrigger()?.templateRef ?? null;
  }

  public readonly _matSelectQuery = viewChild.required(MatSelect);

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
  get dataSource(): ZvSelectDataSource<T> {
    return this._dataSourceInstance;
  }
  set dataSource(dataSource: ZvSelectData<T> | ZvSelectDataSource<T> | string) {
    if (this._dataSourceInput !== dataSource) {
      this._dataSourceInput = dataSource;
      this._switchDataSource(dataSource);
    }
  }

  readonly value = model<T | null>(null, { alias: 'modelValue' });
  @Input('value')
  set valueInput(value: T | null) {
    this.value.set(value);
    this._propagateValueChange(value, ValueChangeSource.valueInput);
  }
  private get _value() {
    return this.value();
  }
  readonly touch = output<void>();
  get ngField(): Field<T | null> | null {
    return (this.formField?.field() as Field<T | null>) ?? null;
  }
  private readonly defaultMatcher = inject(ErrorStateMatcher);
  private readonly parentForm = inject(FormGroupDirective, { optional: true }) ?? inject(NgForm, { optional: true });
  /** If true, then there will be a empty option available to deselect any values (only single select mode) */
  public readonly clearable = input(true);
  /** If true, then there will be a toggle all checkbox available (only multiple select mode) */
  public readonly showToggleAll = input(true);
  public readonly multiple = input(false);
  public readonly panelClass = input<string | string[] | Set<string> | Record<string, boolean>>('');
  @Input() public placeholder = '';
  readonly required = model(false, { alias: 'requiredState' });
  private explicitRequired = false;
  @Input('required')
  set requiredInput(value: boolean | null | undefined) {
    // A binding that resolves to null/undefined is treated like no binding at all, so
    // detection from the bound form control still applies.
    this.explicitRequired = value != null;
    if (value != null) this.required.set(!!value && String(value) !== 'false');
  }

  public readonly selectedLabel = input(true);

  /**
   * Event that emits whenever the raw value of the select changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   *
   * @docs-private
   */
  public readonly valueChange = output<T | null>();
  public readonly openedChange = output<boolean>();
  public readonly selectionChange = output<MatSelectChange>();

  public empty = true;

  public get shouldLabelFloat() {
    return !this.empty;
  }

  public get focused() {
    const matFocus = this._matSelect?.focused;
    if (matFocus != null) {
      return this._focused || matFocus;
    }
    return this._focused;
  }

  readonly disabled = model(false, { alias: 'disabledState' });
  @Input('disabled')
  set disabledInput(value: boolean) {
    this.disabled.set(value != null && String(value) !== 'false');
  }
  readonly isDisabled = this.disabled;
  readonly readonly = input(false, { transform: booleanAttribute });

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
    this.stateChanges.next();
  }

  /** Whether the input is in an error state. */
  get errorState() {
    const snapshot = this._signalErrorSnapshot();
    return snapshot
      ? (this.errorStateMatcher ?? this.defaultMatcher).isErrorState(snapshot, this.parentForm)
      : this._errorStateTracker.errorState;
  }
  set errorState(value: boolean) {
    this._errorStateTracker.errorState = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- constrained by MatSelect.compareWith type
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
    return this._dataSourceInstance?.error;
  }

  /** If true, then the empty option should be shown. */
  public get showEmptyInput() {
    if (this.multiple() || !this.clearable() || !this.items?.length) {
      return false;
    }
    const searchText = (this.filterCtrl.value || '').toLowerCase();
    return !searchText || '--'.indexOf(searchText) > -1;
  }

  public get tooltip(): string {
    // MatSelect is not fully initialized in the beginning, so we need to skip this here until it is ready
    if (this.multiple() && this._matSelect?._selectionModel && this._matSelect.selected) {
      return (this._matSelect.selected as MatOption[]).map((x) => x.viewValue).join(', ');
    }
    return '';
  }

  readonly $currentSelection = signal([] as MatOption<T>[]);
  readonly $customTriggerDataArray = computed(() => {
    const selectedOptions = this.$currentSelection().map((option: MatOption<T>): ZvSelectTriggerData => {
      return {
        value: option.value as unknown as string,
        viewValue: option.viewValue,
      };
    });
    return this._matSelect._isRtl() ? selectedOptions.reverse() : selectedOptions;
  });
  /** The value displayed in the trigger. */
  readonly $customTriggerData = computed(() => {
    if (this.multiple()) {
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
  private _dataSourceInput: ZvSelectData<T> | ZvSelectDataSource<T> | string | undefined;
  private _matSelect!: MatSelect;
  private _focused = false;
  private _onInitCalled = false;
  _errorStateTracker: _ErrorStateTracker;
  private readonly _signalErrorSnapshot = signalErrorControlSnapshot(() => this.ngField);
  private readonly _detectRequired = createRequiredDetector(this.ngControl);
  private readonly _notifyLegacyChange: LegacyChangeNotifier<unknown>;

  constructor() {
    const defaultErrorStateMatcher = inject(ErrorStateMatcher);
    const parentForm = inject(NgForm, { optional: true });
    const parentFormGroup = inject(FormGroupDirective, { optional: true });
    const ngControl = this.ngControl;

    this._notifyLegacyChange = connectLegacyControl(
      this.ngControl,
      this.touch,
      (value) => this._propagateValueChange(value, ValueChangeSource.writeValue),
      (disabled) => this.disabled.set(disabled)
    );

    this._errorStateTracker = new _ErrorStateTracker(defaultErrorStateMatcher, ngControl, parentFormGroup, parentForm, this.stateChanges);

    afterNextRender(() => {
      const select = this._matSelectQuery();
      this._matSelect = select;
      // MatSelect doesn't trigger stateChanges on close which causes problems, so we patch it here.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const close = select.close;
      select.close = () => {
        close.call(select);
        select.stateChanges.next();
      };
    });
  }

  public ngDoCheck() {
    if (!this.explicitRequired) {
      const detected = this._detectRequired();
      if (detected !== null) this.required.set(detected);
    }
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

    const matSelect = this._matSelect ?? this._matSelectQuery();
    this._matSelect = matSelect;

    // before oninit ngControl.control isn't set, but it is needed for datasource creation

    this._switchDataSource(this._dataSourceInput);

    this.filterCtrl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe((searchText) => this.dataSource.searchTextChanged(searchText));
    let selectionSignalInitialized = false;
    matSelect.stateChanges
      .pipe(
        tap(() => {
          if (!selectionSignalInitialized && matSelect._selectionModel) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- MatSelect._selectionModel.selected is MatOption<any>[]
            this.$currentSelection.set(matSelect._selectionModel.selected);
            matSelect._selectionModel.changed.pipe(takeUntil(this._ngUnsubscribe$)).subscribe(() => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- MatSelect._selectionModel.selected is MatOption<any>[]
              this.$currentSelection.set(matSelect._selectionModel.selected);
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

  public focus(options?: FocusOptions): void {
    this._matSelect?.focus(options);
  }

  public onContainerClick(_: MouseEvent): void {
    this._matSelect?.onContainerClick(_);
  }

  public setDescribedByIds(ids: string[]): void {
    this._matSelect?.setDescribedByIds(ids);
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

  public onValueChange(value: T | null) {
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

  private _propagateValueChange(value: unknown, source: ValueChangeSource) {
    this.value.set(value as T | null);
    this.empty = this.multiple() ? !Array.isArray(value) || value.length === 0 : value == null || value === '';
    this._updateToggleAllCheckbox();
    this._pushSelectedValuesToDataSource(this._value);
    if (source !== ValueChangeSource.valueInput) {
      this.valueChange.emit(this._value);
    }
    if (source !== ValueChangeSource.writeValue) {
      this._notifyLegacyChange(this._value);
    }
    this.cd.markForCheck();
  }

  private _pushSelectedValuesToDataSource(value: T | null): void {
    if (!this._dataSourceInstance) {
      return;
    }
    let values: T[];
    if (this.multiple()) {
      values = Array.isArray(value) ? value : [];
    } else {
      values = value ? [value] : [];
    }
    this._dataSourceInstance.selectedValuesChanged(values);
  }

  /** Set up a subscription for the data provided by the data source. */
  private _switchDataSource(dataSource: ZvSelectData<T> | ZvSelectDataSource<T> | string | undefined) {
    if (!this._onInitCalled) {
      // before oninit ngControl.control isn't set, but it is needed for datasource creation
      return;
    }

    // Stop listening for data from the previous data source.
    this._dataSourceInstance?.disconnect();
    this._renderChangeSubscription.unsubscribe();

    // `ZvSelectService` is an abstract token with `providedIn: 'root'`, so an app that never
    // provided an implementation still gets a bare instance back that has no `createDataSource`.
    // Fall back to the raw data source in that case rather than throwing.
    const createDataSource = this.selectService?.createDataSource?.bind(this.selectService);
    this._dataSourceInstance = (createDataSource?.(dataSource, this.ngControl?.control ?? null) ?? dataSource) as ZvSelectDataSource<T>;
    if (!isZvSelectDataSource(this._dataSourceInstance)) {
      throw getSelectUnknownDataSourceError();
    }

    this._dataSourceInstance.searchTextChanged(this.filterCtrl.value);
    this._dataSourceInstance.panelOpenChanged(this._matSelect?.panelOpen ?? false);
    this._pushSelectedValuesToDataSource(this._value);

    this._renderChangeSubscription = this._dataSourceInstance.connect().subscribe((items) => {
      this.items = items || [];
      this._updateToggleAllCheckbox();
      this.cd.markForCheck();
    });
  }

  private _updateToggleAllCheckbox() {
    if (this.multiple() && this.items && Array.isArray(this._value)) {
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
    if (!isFocused) {
      this.touch.emit();
    }
  }
}
