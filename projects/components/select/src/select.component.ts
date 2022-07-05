import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher, MatOption, mixinDisabled, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getSelectUnknownDataSourceError } from './errors';
import { PsSelectItem } from './models';
import { DEFAULT_COMPARER, isPsSelectDataSource, PsSelectDataSource } from './select-data-source';
import { PsSelectOptionTemplateDirective } from './select-option-template.directive';
import { PsSelectTriggerTemplateDirective } from './select-trigger-template.directive';
import { PsSelectService } from './select.service';

const enum ValueChangeSource {
  matSelect = 1,
  toggleAll = 2,
  valueInput = 3,
  writeValue = 4,
}

// Boilerplate for applying mixins to MatSelect.
/** @docs-private */
class PsSelectBase {
  readonly stateChanges = new Subject<void>();

  constructor(
    public _elementRef: ElementRef,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}
// eslint-disable-next-line @typescript-eslint/naming-convention
const _PsSelectMixinBase = mixinDisabled(mixinErrorState(PsSelectBase));

@Component({
  selector: 'ps-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disabled'],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class.ps-select-multiple]': 'multiple',
    '[class.ps-select-disabled]': 'disabled',
    '[class.ps-select-invalid]': 'errorState',
    '[class.ps-select-required]': 'required',
    '[class.ps-select-empty]': 'empty',
    class: 'ps-select',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: PsSelectComponent }],
})
export class PsSelectComponent<T = unknown>
  extends _PsSelectMixinBase
  implements ControlValueAccessor, MatFormFieldControl<T>, DoCheck, OnInit, OnDestroy
{
  public static nextId = 0;
  @HostBinding() public id = `ps-select-${PsSelectComponent.nextId++}`;

  @ContentChild(PsSelectOptionTemplateDirective, { read: TemplateRef })
  public optionTemplate: TemplateRef<any> | null = null;

  @ContentChild(PsSelectTriggerTemplateDirective, { read: TemplateRef })
  public triggerTemplate: TemplateRef<any> | null = null;

  @ViewChild(MatSelect, { static: true }) public set setMatSelect(select: MatSelect) {
    this._matSelect = select;

    // MatSelect doesn't trigger stateChanges on close which causes problems, so we patch it here.
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

  @Input() public override errorStateMatcher: ErrorStateMatcher = null;

  @Input() public panelClass: string | string[] | Set<string> | { [key: string]: any } = null;

  @Input() public placeholder: string = null;

  @Input() public required = false;

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
    // eslint-disable-next-line import/no-deprecated
    return this._matSelect.focused;
  }

  public get compareWith(): (o1: any, o2: any) => boolean {
    return this._dataSourceInstance?.compareWith ?? DEFAULT_COMPARER;
  }

  public readonly controlType = 'ps-select';

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
    return !!this.error;
  }

  /** the error that occured while loading the options */
  public get error() {
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
      return (<MatOption[]>this._matSelect.selected).map((x) => x.viewValue).join(', ');
    }
    return '';
  }

  /** The value displayed in the trigger. */
  get customTriggerData(): { value: string; viewValue: string } | { value: string; viewValue: string }[] {
    if (this.empty) {
      return null;
    }

    const selectedOptions = this._matSelect._selectionModel.selected.map(toTriggerDataObj);
    if (this.multiple) {
      if (this._matSelect._isRtl()) {
        selectedOptions.reverse();
      }

      return selectedOptions;
    }

    return selectedOptions[0];

    function toTriggerDataObj(option: MatOption): { value: string; viewValue: string } {
      return {
        value: option.value,
        viewValue: option.viewValue,
      };
    }
  }

  /** Subject that emits when the component has been destroyed. */
  private _ngUnsubscribe$ = new Subject<void>();

  /** Subscription that listens for the data provided by the data source. */
  private _renderChangeSubscription = Subscription.EMPTY;

  /** The data source. */
  private _dataSourceInstance: PsSelectDataSource<T>;

  /** The value the [dataSource] input was called with. */
  private _dataSourceInput: any;

  private _matSelect!: MatSelect;

  private _onInitCalled = false;

  /** View -> model callback called when value changes */
  private _onChange: (value: any) => void = () => {};

  constructor(
    elementRef: ElementRef,
    defaultErrorStateMatcher: ErrorStateMatcher,
    private selectService: PsSelectService,
    private cd: ChangeDetectorRef,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Optional() @Self() public override ngControl: NgControl
  ) {
    super(elementRef, defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  public ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public ngOnInit() {
    this._onInitCalled = true;

    // before oninit ngControl.control isn't set, but it is needed for datasource creation
    this._switchDataSource(this._dataSourceInput);

    this.filterCtrl.valueChanges
      .pipe(takeUntil(this._ngUnsubscribe$))
      .subscribe((searchText) => this.dataSource.searchTextChanged(searchText));

    this._matSelect.stateChanges.pipe(takeUntil(this._ngUnsubscribe$)).subscribe(this.stateChanges);
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
    this._matSelect.registerOnTouched(fn);
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public onSelectionChange(event: MatSelectChange) {
    this._updateToggleAllCheckbox();
    this.selectionChange.emit(event);
  }

  public onOpenedChange(open: boolean) {
    this.openedChange.emit(open);
    this._dataSourceInstance.panelOpenChanged(open);
  }

  public onValueChange(value: any) {
    this._propagateValueChange(value, ValueChangeSource.matSelect);
  }

  public onToggleAll(state: boolean) {
    const newValue = state ? (this.items as PsSelectItem<T>[]).map((x) => x.value) : [];
    this._propagateValueChange(newValue, ValueChangeSource.toggleAll);
  }

  public trackByOptions(_: number, item: PsSelectItem<T>) {
    return `${item.value}#${item.label}`;
  }

  private _propagateValueChange(value: any, source: ValueChangeSource) {
    this._value = value;
    this.empty = this.multiple ? !value?.length : !value;
    this._updateToggleAllCheckbox();
    this._pushSelectedValuesToDataSource(value);
    if (source !== ValueChangeSource.valueInput) {
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

    this._dataSourceInstance = this.selectService.createDataSource(dataSource, this.ngControl?.control);
    if (!isPsSelectDataSource(this._dataSourceInstance)) {
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
}
