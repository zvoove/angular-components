import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Optional,
  Output,
  Self,
  ViewChild,
  ViewEncapsulation,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { PsSelectOptionTemplateDirective } from './select-option-template.directive';

@Component({
  selector: 'ps-select',
  template: `
    <div [formGroup]="formGroup" [matTooltip]="tooltip" [matTooltipDisabled]="!multiple">
      <mat-select
        [formControl]="formControl"
        [compareWith]="compareWith || defaultCompareWith"
        [multiple]="multiple"
        [panelClass]="panelClass"
        [placeholder]="placeholder"
        [required]="required"
        [disableOptionCentering]="true"
        (selectionChange)="onSelectionChange($event)"
        (openedChange)="onOpenedChange($event)"
      >
        <ps-select-data
          [dataSource]="dataSource"
          [compareWith]="compareWith"
          [clearable]="clearable"
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
export class PsSelectComponent<T = any> implements ControlValueAccessor, MatFormFieldControl<T> {
  public static nextId = 0;
  @HostBinding() public id = `ps-select-${PsSelectComponent.nextId++}`;

  @ContentChild(PsSelectOptionTemplateDirective, { read: TemplateRef, static: false })
  public optionTemplate: TemplateRef<any> | null = null;

  @ViewChild(MatSelect, { static: true }) public set setMatSelect(select: MatSelect) {
    this._matSelect = select;

    // MatSelect hat nen Bug und triggert beim close kein stateChanges, deshalb patchen wir das hier dran, bis sie es fixen.
    const close = select.close;
    select.close = () => {
      close.call(select);
      select.stateChanges.next();
    };

    // Bindet unsere onChange/onTouched Callbacks an die Callbacks von MatSelect
    bindCallbacksToControl(this._matSelect, 'registerOnChange', (value: any) => this._onChange(value));
    bindCallbacksToControl(this._matSelect, 'registerOnTouched', () => this._onTouched());
  }

  /**
   * The selects's source of data, which can be provided in three ways (in order of complexity):
   *   - Simple data array (each object represents one select option)
   *   - Stream that emits a data array each time the array changes
   *   - `DataSource` object that implements the connect/disconnect interface.
   */
  @Input() public dataSource: any;
  @Input() public compareWith: (o1: any, o2: any) => boolean = null;
  /** Gibt an, ob im singleselect Modus eine leere Option auswählbar sein soll */
  @Input() public clearable = true;
  @Input()
  public set disabled(value: boolean) {
    this.setDisabledState(value);
  }
  public get disabled(): boolean {
    return this.formControl.disabled;
  }
  @Input() public multiple = false;
  @Input() public panelClass: string | string[] | Set<string> | { [key: string]: any };
  @Input() public placeholder: string;
  @Input() public required = false;
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
  public controlType = 'ps-select';

  public get formGroup(): FormGroup {
    return (this._parentFormGroup && this._parentFormGroup.form) || (this._parentForm && this._parentForm.form) || this._dummyForm;
  }
  public get formControl(): FormControl {
    return (this.ngControl && (this.ngControl.control as FormControl)) || this._dummyControl;
  }

  public get tooltip(): string {
    // MatSelect ist anfangs noch nicht initialisiert, deshalb die ganzen Checks
    if (this.multiple && this._matSelect && this._matSelect._selectionModel && this._matSelect.selected) {
      return (<MatOption[]>this._matSelect.selected).map(x => x.viewValue).join(', ');
    }
    return '';
  }

  private _dummyForm = new FormGroup({});
  private _dummyControl = new FormControl(null);
  private _matSelect: MatSelect;

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

  public defaultCompareWith = (o1: any, o2: any) => o1 === o2;

  public onContainerClick(_: MouseEvent): void {}
  public setDescribedByIds(_: string[]): void {}

  public writeValue(_: any) {
    // Brauchen wir nicht, da wir das FormControl an das MatSelect weiterreichen
  }

  public registerOnChange(fn: () => void) {
    this._onChange = <any>fn;
  }

  public registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    if (this.formControl.disabled === isDisabled) {
      return;
    }
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  public onSelectionChange(event: MatSelectChange) {
    this.selectionChange.emit(event);
  }

  public onOpenedChange(event: boolean) {
    this.openedChange.emit(event);
  }

  private _onChange: (value: any) => void = (_: any) => {};
  private _onTouched: () => void = () => {};
}

function bindCallbacksToControl(
  otherControl: ControlValueAccessor,
  functionName: 'registerOnTouched' | 'registerOnChange',
  ownRegisteredCallback: (value: any) => void
) {
  const originalFn = otherControl[functionName];
  otherControl[functionName] = (fn: (data: any) => void) => {
    originalFn.call(otherControl, (value: any) => {
      fn(value);
      ownRegisteredCallback(value);
    });
  };
}
