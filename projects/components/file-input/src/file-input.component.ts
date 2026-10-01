/* eslint-disable @angular-eslint/no-input-rename -- Backing models retain existing public binding names via compatibility setters. */
/* eslint-disable @angular-eslint/prefer-signals -- Compatibility value setter and Material string id */
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ErrorStateMatcher, _ErrorStateTracker } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FORM_FIELD, FormValueControl, Field } from '@angular/forms/signals';
import { LegacyChangeNotifier, connectLegacyControl, createRequiredDetector, signalErrorControlSnapshot } from '@zvoove/components/form-base';
import { model, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

let nextUniqueId = 0;

@Component({
  selector: 'zv-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  imports: [MatButtonModule, MatIconModule],
  host: {
    // Native input properties that are overwritten by Angular inputs need to be synced with
    // the native input element. Otherwise property bindings for those don't work.
    '[attr.id]': 'id',
    '[attr.placeholder]': 'placeholder',
    '[attr.disabled]': 'isDisabled()',
    '[attr.required]': 'required()',
    '[attr.readonly]': 'readonly() || null',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'required().toString()',
  },
  providers: [{ provide: MatFormFieldControl, useExisting: ZvFileInput }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ZvFileInput implements FormValueControl<File | null>, MatFormFieldControl<File | null>, OnDestroy, OnInit, DoCheck {
  readonly labelledById = signal<string | null>(null);
  setLabelledById(id: string | null) {
    this.labelledById.set(id);
  }

  private readonly formField = inject(FORM_FIELD, { optional: true, self: true });
  public readonly ngControl = this.formField ? null : inject(NgControl, { optional: true, self: true });
  public readonly _cd = inject(ChangeDetectorRef);

  fileSelectText = $localize`:@@zvc.chooseFile:Please choose a file.`;

  public readonly accept = input<string[]>([]);

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
  readonly stateChanges: Subject<void> = new Subject<void>();

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
  readonly disabled = model(false, { alias: 'disabledState' });
  @Input('disabled')
  set disabledInput(value: boolean) {
    this.disabled.set(value != null && String(value) !== 'false');
  }
  readonly isDisabled = this.disabled;

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
  @Input() placeholder = '';

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly required = model(false, { alias: 'requiredState' });
  private explicitRequired = false;
  @Input('required')
  set requiredInput(value: boolean | null | undefined) {
    // A binding that resolves to null/undefined is treated like no binding at all, so
    // detection from the bound form control still applies.
    this.explicitRequired = value != null;
    if (value != null) this.required.set(coerceBooleanProperty(value));
  }

  /** An object used to control when error messages are shown. */
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

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly value = model<File | null>(null, { alias: 'modelValue' });
  @Input('value')
  set valueInput(value: File | null) {
    this.value.set(value);
    this.stateChanges.next();
  }
  readonly valueChange = output<File | null>();
  readonly touch = output<void>();
  get ngField(): Field<File | null> | null {
    return (this.formField?.field() as Field<File | null>) ?? null;
  }
  private readonly defaultMatcher = inject(ErrorStateMatcher);
  private readonly parentForm = inject(FormGroupDirective, { optional: true }) ?? inject(NgForm, { optional: true });

  /** Whether the element is readonly. */
  readonly readonly = input(false, { transform: coerceBooleanProperty });

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  get empty(): boolean {
    return (this.value() === null || this.value() === undefined) && !this.autofilled;
  }

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  readonly shouldLabelFloat = true;

  protected _uid = `zv-file-input-${nextUniqueId++}`;
  /** The aria-describedby attribute on the input for improved a11y. */
  _ariaDescribedby!: string;

  private readonly uploadButton = viewChild<ElementRef<HTMLButtonElement>>('uploadButton');
  public readonly _inputfieldViewChild = viewChild<ElementRef<HTMLInputElement>>('input');
  _errorStateTracker: _ErrorStateTracker;
  private readonly _signalErrorSnapshot = signalErrorControlSnapshot(() => this.ngField);
  private readonly _detectRequired = createRequiredDetector(this.ngControl);
  private readonly _notifyLegacyChange: LegacyChangeNotifier<File | null>;

  constructor() {
    const ngControl = this.ngControl;
    const _parentForm = inject(NgForm, { optional: true });
    const _parentFormGroup = inject(FormGroupDirective, { optional: true });
    const _defaultErrorStateMatcher = inject(ErrorStateMatcher);

    this._notifyLegacyChange = connectLegacyControl(
      this.ngControl,
      this.touch,
      (value) => {
        this.valueInput = value instanceof File ? value : null;
      },
      (disabled) => this.disabled.set(disabled)
    );
    effect(() => {
      if (!this.value()) this.reset();
    });

    this._errorStateTracker = new _ErrorStateTracker(
      _defaultErrorStateMatcher,
      ngControl,
      _parentFormGroup,
      _parentForm,
      this.stateChanges
    );
  }

  ngOnInit() {
    // Force setter to be called in case id was not specified.
    // eslint-disable-next-line no-self-assign
    this.id = this.id;
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  ngDoCheck() {
    if (!this.explicitRequired) {
      const detected = this._detectRequired();
      if (detected !== null) this.required.set(detected);
    }
    if (this.ngControl) {
      // We need to re-evaluate this on every change detection cycle, because there are some
      // error triggers that we can't subscribe to (e.g. parent form submissions). This means
      // that whatever logic is in here has to be super lean or we risk destroying the performance.
      this.updateErrorState();
    }
  }

  /** Refreshes the error state of the input. */
  updateErrorState() {
    this._errorStateTracker.updateErrorState();
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
    this.uploadButton()?.nativeElement.focus(options);
  }

  reset() {
    const input = this._inputfieldViewChild()?.nativeElement;
    if (input) input.value = '';
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
    this.value.set(file);
    this.stateChanges.next();
    if (!file) this.reset();
    this._notifyLegacyChange(file);
    this.valueChange.emit(file);
    this.touch.emit();
  }
}
