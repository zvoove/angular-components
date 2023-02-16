/* eslint-disable @angular-eslint/no-conflicting-lifecycle */
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  Renderer2,
  Self,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { API, create, Options } from 'nouislider';
import { Subject } from 'rxjs';
import { DefaultFormatter } from './formatter';

declare type ZvSliderConnect = boolean | boolean[];

// Boilerplate for applying mixins to ZvSlider.
/** @docs-private */
export class ZvSliderBase {
  readonly stateChanges = new Subject<void>();

  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl
  ) {}
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _ZvSliderMixinBase = mixinErrorState(ZvSliderBase);

// eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
@Component({
  selector: 'zv-slider',
  template: ` <div></div> `,
  styleUrls: ['./slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MatFormFieldControl, useExisting: ZvSliderComponent }],
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[attr.id]': 'id',
    '[class.zv-slider-invalid]': 'errorState',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-invalid]': 'errorState',
    '[attr.aria-required]': 'required.toString()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZvSliderComponent
  extends _ZvSliderMixinBase
  implements ControlValueAccessor, MatFormFieldControl<number | number[]>, OnInit, OnChanges, DoCheck
{
  public static nextId = 0;

  /**
   * Defines the step size when sliding the handle
   */
  @Input() public stepSize = 1;

  /**
   * When true, two handles are shown
   */
  @Input()
  public get isRange(): boolean {
    return this._isRange;
  }
  public set isRange(v: boolean) {
    this._isRange = coerceBooleanProperty(v);
  }
  private _isRange = false;

  /**
   * When true, a tooltip is shown while sliding the handle
   */
  @Input() public showTooltip = false;

  /**
   * Defines if and how the slider handle should be connected to the sides or the other handle
   */
  @Input() public connect: ZvSliderConnect;

  /**
   * Implemented as part of ZvFormFieldControl.
   *
   * @docs-private
   */
  public shouldLabelFloat = true;

  /**
   * Implemented as part of ZvFormFieldControl.
   *
   * @docs-private
   */
  public noUnderline = true;

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
  protected _id: string;
  protected _uid = `zv-slider-${ZvSliderComponent.nextId++}`;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  public placeholder: string;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  public focused = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  public controlType = 'zv-slider';
  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  public autofilled?: boolean;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  public set required(required: boolean) {
    this._required = !!required;
    this.stateChanges.next();
  }
  public get required() {
    return this._required;
  }
  private _required = false;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = !!disabled;
    this.setDisabledState(this.disabled);
    this.stateChanges.next();
  }
  public get disabled() {
    return this._disabled;
  }
  private _disabled = false;

  /** The maximum value that the slider can have. */
  @Input()
  get max(): number {
    return this._max;
  }
  set max(v: number) {
    this._max = coerceNumberProperty(v, this._max);
  }
  private _max = 100;

  /** The minimum value that the slider can have. */
  @Input()
  get min(): number {
    return this._min;
  }
  set min(v: number) {
    this._min = coerceNumberProperty(v, this._min);

    // If the value wasn't explicitly set by the user, set it to the min.
    if (this._value === null) {
      this.value = this._min;
    }
  }
  private _min = 0;

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  @Input()
  get value(): number | number[] | null {
    // If the value needs to be read and it is still uninitialized, initialize it to the min.
    if (this._value === null) {
      this.value = this.isRange ? [this.min, this.max] : this.min;
    }
    return this._value;
  }
  set value(v: number | number[] | null) {
    this._rawProvidedValue = v;
    if (v !== this._value) {
      if (this.isRange) {
        const range = [0, 0];
        if (Array.isArray(v)) {
          range[0] = coerceNumberProperty(v[0], this.min);
          range[1] = coerceNumberProperty(v[1], this.max);
        }
        this._value = range;
      } else {
        this._value = coerceNumberProperty(v);
      }
      if (this._slider) {
        this._slider.set(this._value);
      }
    }
  }
  private _value: number | number[];
  private _rawProvidedValue: any = null;

  @Output() public readonly valueChange = new EventEmitter<number | number[]>();

  /**
   * Implemented as part of MatFormFieldControl.
   *
   * @docs-private
   */
  public get empty() {
    return !this.value;
  }

  /** The aria-describedby attribute on the input for improved a11y. */
  public _ariaDescribedby: string;

  private _formatter = new DefaultFormatter();
  private _slider: API;

  constructor(
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Self() public override ngControl: NgControl,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    private el: ElementRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    const inputsConfig: Options = {
      start: this.value,
      step: this.stepSize,
      range: { min: this.min, max: this.max },
      tooltips: this.showTooltip,
      format: this._formatter,
      connect: this.connect || !!this.isRange,
    };

    this._slider = create(this.el.nativeElement.querySelector('div'), inputsConfig);
    this._slider.on('change', () => {
      const value = this._slider.get();
      this.value = Array.isArray(value) ? value.map(Number) : +value;
      this._emitChangeEvent();
      this._onTouchedFnc();
      this.cd.markForCheck();
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.isRange) {
      // when value was set before the @Inputs were set, then isRange wasn't known and the value could be wrong.
      // So we set the _rawProvidedValue here again to fix that
      this.value = this._rawProvidedValue;
    }
    if (this._slider && (changes.isRange || changes.min || changes.max || changes.stepSize || changes.showTooltip)) {
      this._slider.updateOptions(
        {
          start: this.value,
          step: this.stepSize,
          range: { min: this.min, max: this.max },
          tooltips: this.showTooltip,
        },
        false
      );
    }
  }

  public ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public writeValue(obj: number | number[] | null): void {
    this.value = obj;
  }

  public registerOnChange(fn: any): void {
    this._onChangeFnc = fn;
  }

  public registerOnTouched(fn: any): void {
    this._onTouchedFnc = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    const slider = this.el.nativeElement.childNodes[0];
    if (isDisabled) {
      this.renderer.setAttribute(slider, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(slider, 'disabled');
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

  public onContainerClick(_: MouseEvent): void {}

  private _onChangeFnc: (value: any) => void = () => {};
  private _onTouchedFnc: () => void = () => {};

  /** Emits a change event if the current value is different from the last emitted value. */
  private _emitChangeEvent() {
    this._onChangeFnc(this.value);
    this.valueChange.emit(this.value);
  }
}
