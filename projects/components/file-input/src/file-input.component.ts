/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';

import type {} from '@angular/localize/init';

let nextUniqueId = 0;

// Boilerplate for applying mixins to ZvNumberInput.
/** @docs-private */
class ZvFileInputBase {
  readonly stateChanges = new Subject<void>();

  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    /** @docs-private */
    public ngControl: NgControl
  ) {}
}
const zvFileInputMixinBase = mixinErrorState(ZvFileInputBase);

@Component({
  selector: 'zv-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, NgIf],

  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[attr.id]': 'id',
    '[attr.placeholder]': 'placeholder',
    '[attr.disabled]': 'disabled',
    '[attr.required]': 'required',
    '[attr.readonly]': 'readonly || null',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'required.toString()',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvFileInputComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvFileInputComponent
  extends zvFileInputMixinBase
  implements ControlValueAccessor, MatFormFieldControl<File>, OnChanges, OnDestroy, OnInit, DoCheck, CanUpdateErrorState
{
  fileSelectText = $localize`:@@download.chooseFile:Please choose a file.`;

  @Input() accept: string[] = [];

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  focused = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  override readonly stateChanges: Subject<void> = new Subject<void>();

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  controlType = 'zv-file-input';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  autofilled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
    this._cd.markForCheck();
  }
  protected _disabled = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value || this._uid;
  }
  protected _id = '';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input() placeholder: string = '';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this._cd.markForCheck();
  }
  protected _required = false;

  /** An object used to control when error messages are shown. */
  @Input() override errorStateMatcher!: ErrorStateMatcher;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get value(): File | null {
    return this._value;
  }
  set value(value: File | null) {
    if (value !== this.value) {
      this._value = value;
      this.stateChanges.next();
      this._cd.markForCheck();
    }
  }
  _value: File | null = null;

  @Output() public readonly valueChange = new EventEmitter<File | null>();

  /** Whether the element is readonly. */
  @Input()
  get readonly(): boolean {
    return this._readonly;
  }
  set readonly(value: boolean) {
    this._readonly = coerceBooleanProperty(value);
    this._cd.markForCheck();
  }
  private _readonly = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  get empty(): boolean {
    return (this._value === null || this._value === undefined) && !this.autofilled;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    return true;
  }

  protected _uid = `zv-file-input-${nextUniqueId++}`;
  /** The aria-describedby attribute on the input for improved a11y. */
  _ariaDescribedby!: string;

  @ViewChild('input', { static: true })
  _inputfieldViewChild!: ElementRef<HTMLInputElement>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onModelChange: (val: unknown) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onModelTouched = () => {};

  constructor(
    /** @docs-private */
    @Optional() @Self() public override ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    public _cd: ChangeDetectorRef
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    // Force setter to be called in case id was not specified.
    // eslint-disable-next-line no-self-assign
    this.id = this.id;
  }

  ngOnChanges() {
    this.stateChanges.next();
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  ngDoCheck() {
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  onContainerClick() {
    if (!this.focused) {
      this.focus();
    }
  }

  /** Focuses the input. */
  focus(options?: FocusOptions): void {
    this._inputfieldViewChild.nativeElement.focus(options);
  }

  writeValue(value: unknown): void {
    this.value = value instanceof File ? value : null;
  }

  registerOnChange(fn: (val: unknown) => void): void {
    this._onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onModelTouched = fn;
  }

  setDisabledState(val: boolean): void {
    this.disabled = val;
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0] ?? null;
    this.setFile(file);
  }

  removeFile() {
    this.setFile(null);
  }

  setFile(file: File | null) {
    this.value = file;
    this._onModelChange(file);
    this.valueChange.emit(file);
    this._onModelTouched();
  }
}
