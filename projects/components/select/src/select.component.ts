import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  DoCheck,
  EventEmitter,
  HostBinding,
  Input,
  Optional,
  Output,
  Self,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher, MatOption } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { PsSelectOptionTemplateDirective } from './select-option-template.directive';
import { PsSelectTriggerTemplateDirective } from './select-trigger-template.directive';

@Component({
  selector: 'ps-select',
  template: `
    <div [formGroup]="formGroup" [matTooltip]="tooltip" [matTooltipDisabled]="!multiple">
      <mat-select
        [formControl]="formControl"
        [disableOptionCentering]="true"
        (selectionChange)="onSelectionChange($event)"
        (openedChange)="onOpenedChange($event)"
      >
        <mat-select-trigger *ngIf="triggerTemplate && !empty">
          <ng-template [ngTemplateOutlet]="triggerTemplate" [ngTemplateOutletContext]="{ $implicit: customTriggerData }"></ng-template>
        </mat-select-trigger>
        <ps-select-data
          [dataSource]="dataSource"
          [compareWith]="compareWith"
          [clearable]="clearable"
          [showToggleAll]="showToggleAll"
          [optionTemplate]="optionTemplate"
        ></ps-select-data>
      </mat-select>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line: no-host-metadata-property
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
export class PsSelectComponent<T = any> implements ControlValueAccessor, MatFormFieldControl<T>, DoCheck {
  public static nextId = 0;
  @HostBinding() public id = `ps-select-${PsSelectComponent.nextId++}`;

  @ContentChild(PsSelectOptionTemplateDirective, { read: TemplateRef, static: false })
  public optionTemplate: TemplateRef<any> | null = null;

  @ContentChild(PsSelectTriggerTemplateDirective, { read: TemplateRef, static: false })
  public triggerTemplate: TemplateRef<any> | null = null;

  @ViewChild(MatSelect, { static: true }) public set setMatSelect(select: MatSelect) {
    this._matSelect = select;

    // MatSelect doesn't trigger stateChanges on close which causes problems, so we patch it here.
    const close = select.close;
    select.close = () => {
      close.call(select);
      select.stateChanges.next();
    };

    // Forward the ControlValueAccessor methods to mat-select
    this.writeValue = select.writeValue.bind(select);
    this.registerOnChange = select.registerOnChange.bind(select);
    this.registerOnTouched = select.registerOnTouched.bind(select);
    this.setDisabledState = select.setDisabledState.bind(select);
    select.writeValue = select.registerOnChange = select.registerOnTouched = select.setDisabledState = () => {};
  }

  /**
   * The selects's source of data, which can be provided in three ways (in order of complexity):
   *   - Simple data array (each object represents one select option)
   *   - Stream that emits a data array each time the array changes
   *   - `DataSource` object that implements the connect/disconnect interface.
   */
  @Input() public dataSource: any;

  @Input() public compareWith: ((o1: any, o2: any) => boolean) | null = null;

  /** When true, an empty option is added to the top of the list (ignored for multiple true) */
  @Input() public clearable = true;

  /** If true, then there will be a toggle all checkbox available (only multiple select mode) */
  @Input() public showToggleAll = true;

  @Input() public set disabled(value: boolean) {
    this.setDisabledState(value);
  }
  public get disabled(): boolean {
    return this.formControl.disabled;
  }

  @Input() public set multiple(value: boolean) {
    this._matSelect.multiple = value;
  }
  public get multiple(): boolean {
    return this._matSelect.multiple;
  }

  @Input() public set errorStateMatcher(value: ErrorStateMatcher) {
    this._matSelect.errorStateMatcher = value;
  }
  public get errorStateMatcher(): ErrorStateMatcher {
    return this._matSelect.errorStateMatcher;
  }

  @Input() public set panelClass(value: string | string[] | Set<string> | { [key: string]: any }) {
    this._matSelect.panelClass = value;
  }
  public get panelClass(): string | string[] | Set<string> | { [key: string]: any } {
    return this._matSelect.panelClass;
  }

  @Input() public set placeholder(value: string) {
    this._matSelect.placeholder = value;
  }
  public get placeholder(): string {
    return this._matSelect.placeholder;
  }

  @Input() public set required(value: boolean) {
    this._matSelect.required = value;
  }
  public get required(): boolean {
    return this._matSelect.required;
  }

  @Output() public openedChange = new EventEmitter<boolean>();
  @Output() public selectionChange = new EventEmitter<MatSelectChange>();

  public get value(): T | null {
    return this._matSelect.value;
  }
  public get empty() {
    return this._matSelect.empty;
  }
  public get shouldLabelFloat() {
    return this._matSelect.shouldLabelFloat;
  }
  public get stateChanges() {
    return this._matSelect.stateChanges;
  }
  public get focused() {
    // tslint:disable-next-line: deprecation
    return this._matSelect.focused;
  }
  public get errorState() {
    return this._matSelect.errorState;
  }
  public readonly controlType = 'ps-select';

  public get formGroup(): FormGroup {
    // ngModel or envent binding only -> dummy control
    return (this._parentFormGroup && this._parentFormGroup.form) || (this._parentForm && this._parentForm.form) || this._dummyForm;
  }
  public get formControl(): FormControl {
    // event binding only -> dummy control
    return (this.ngControl && (this.ngControl.control as FormControl)) || this._dummyControl;
  }

  public get tooltip(): string {
    // MatSelect is not fully initialized in the beginning, so we need to skip this here until it is ready
    if (this.multiple && this._matSelect && this._matSelect._selectionModel && this._matSelect.selected) {
      return (<MatOption[]>this._matSelect.selected).map(x => x.viewValue).join(', ');
    }
    return '';
  }

  /** The value displayed in the trigger. */
  get customTriggerData(): { value: string; viewValue: string } | { value: string; viewValue: string }[] {
    if (this.empty) {
      return null;
    }

    if (this.multiple) {
      const selectedOptions = this._matSelect._selectionModel.selected.map(toTriggerDataObj);

      if (this._matSelect._isRtl()) {
        selectedOptions.reverse();
      }

      return selectedOptions;
    }

    return toTriggerDataObj(this._matSelect._selectionModel.selected[0]);

    function toTriggerDataObj(option: MatOption): { value: string; viewValue: string } {
      return {
        value: option.value,
        viewValue: option.viewValue,
      };
    }
  }

  private _dummyForm = new FormGroup({});
  private _dummyControl = new FormControl(null);
  private _matSelect!: MatSelect;

  constructor(
    @Optional() private _parentForm: NgForm,
    @Optional() private _parentFormGroup: FormGroupDirective,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }

  public ngDoCheck() {
    // Wen need to call MatSelects ngDoCheck here to update the errorState.
    // Otherwise the errorState would be updated after angular is done with checking
    // for changes on ps-select, which would cause problems with mat-form-field.
    this._matSelect.ngDoCheck();
  }

  public onContainerClick(_: MouseEvent): void {
    this._matSelect.onContainerClick();
  }
  public setDescribedByIds(ids: string[]): void {
    this._matSelect.setDescribedByIds(ids);
  }

  public writeValue(_: any) {
    // This method is overwritten in setMatSelect
  }

  public registerOnChange(fn: () => void) {
    // This method is overwritten in setMatSelect
  }

  public registerOnTouched(fn: any): void {
    // This method is overwritten in setMatSelect
  }

  public setDisabledState(isDisabled: boolean): void {
    // This method is overwritten in setMatSelect
  }

  public onSelectionChange(event: MatSelectChange) {
    this.selectionChange.emit(event);
  }

  public onOpenedChange(event: boolean) {
    this.openedChange.emit(event);
  }
}
