import { AsyncPipe, isPlatformServer } from '@angular/common';
import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import {
  FloatLabelType,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatError,
  MatFormField,
  MatFormFieldControl,
  MatFormFieldDefaultOptions,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { type MatInput } from '@angular/material/input';
import { IZvFormError, ZvFormService, hasRequiredField } from '@zvoove/components/form-base';
import { Observable, Subscription, of } from 'rxjs';
import { DummyMatFormFieldControl } from './dummy-mat-form-field-control';

export declare type ZvFormFieldSubscriptType = 'resize' | 'single-line';

export interface ZvFormFieldConfig {
  subscriptType?: ZvFormFieldSubscriptType;
  hintToggle?: boolean;
  requiredText?: string;
}

export const ZV_FORM_FIELD_CONFIG = new InjectionToken<ZvFormFieldConfig>('ZV_FORM_FIELD_CONFIG');

function applyConfigDefaults(
  config: ZvFormFieldConfig | null,
  matConfig: MatFormFieldDefaultOptions | null
): {
  subscriptType: ZvFormFieldSubscriptType;
  hintToggle: boolean;
  requiredText: string | null;
  floatLabel: FloatLabelType;
} {
  return {
    hintToggle: config?.hintToggle ?? false,
    subscriptType: config?.subscriptType ?? 'resize',
    requiredText: config?.requiredText ?? null,
    floatLabel: matConfig?.floatLabel ?? 'auto',
  };
}

@Component({
  selector: 'zv-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  host: {
    '[class.zv-form-field--subscript-resize]': 'subscriptType() === "resize"',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatFormField, MatLabel, MatPrefix, MatSuffix, MatIconButton, MatIcon, MatError, AsyncPipe],
})
export class ZvFormField implements AfterContentChecked, OnDestroy {
  private isServer = isPlatformServer(inject(PLATFORM_ID));
  private _elementRef = inject(ElementRef);
  private formsService = inject(ZvFormService);
  private defaults = applyConfigDefaults(
    inject(ZV_FORM_FIELD_CONFIG, { optional: true }),
    inject(MAT_FORM_FIELD_DEFAULT_OPTIONS, { optional: true })
  );

  public readonly createLabel = input(true);
  public readonly hint = input('');
  public readonly floatLabel = model<FloatLabelType>(this.defaults.floatLabel);
  public readonly subscriptType = input<ZvFormFieldSubscriptType>(this.defaults.subscriptType);
  public readonly hintToggle = input<boolean>(this.defaults.hintToggle);

  readonly _matFormField = viewChild.required(MatFormField);

  /** We can get the FromControl from this */
  readonly _ngControl = contentChild(NgControl);

  /** The MatFormFieldControl or null, if it is no MatFormFieldControl */
  readonly _control = contentChild(MatFormFieldControl);

  /** The MatLabel, if it is set or null */
  readonly _labelChild = contentChild(MatLabel);

  public readonly _prefixChildren = contentChildren(MatPrefix);
  public readonly _suffixChildren = contentChildren(MatSuffix);

  // mat-form-field childs, that we dont support:
  // @ContentChild(MatPlaceholder) _placeholderChild: MatPlaceholder; // Deprecated, placeholder attribute of the form field control should be used instead!
  // @ContentChildren(MatError) public _errorChildren: QueryList<MatError>; // Will be created automatically
  // @ContentChildren(MatHint) public _hintChildren: QueryList<MatHint>; // No idea how to make this work...

  public readonly showHintToggle = computed(() => !!this.hint() && this.hintToggle());

  // No computed, because it wouldn't detect control.required/disabled changes anymore
  public get hintText(): string {
    const hintShouldBeShown = this.showHint() || !this.hintToggle();

    if (!hintShouldBeShown) {
      return '';
    }

    const _control = this._control();
    const isRequired = _control?.required;
    const isDisabled = _control?.disabled;
    if (!isRequired || isDisabled) {
      return this.hint();
    }

    const requiredText = this.defaults.requiredText;
    return [requiredText, this.hint()].filter((s) => !!s).join('. ');
  }

  /** The error messages to show */
  public errors$: Observable<IZvFormError[]> = of([]);

  /** Indicates if the control is no real MatFormFieldControl */
  public get emulated() {
    return this.matFormFieldControl() instanceof DummyMatFormFieldControl;
  }

  /** Hide the underline for the control */
  public get noUnderline() {
    return this.emulated || !!this.realFormControl?.noUnderline || false;
  }
  public readonly showHint = linkedSignal<boolean>(() => !this.hintToggle());
  public readonly calculatedLabel = signal<string | null>(null);

  private readonly formControl = computed<FormControl | null>(() => (this._ngControl()?.control as FormControl) ?? null);

  /** Either the MatFormFieldControl or a DummyMatFormFieldControl */
  private matFormFieldControl = computed<MatFormFieldControl<unknown>>(() => this._control() || this.#lazyDummyMatformFieldControl.val);

  /** The real control instance (MatSlider, MatSelect, MatCheckbox, ...) */
  private realFormControl!: { noUnderline?: boolean; shouldLabelFloat?: boolean };

  /** The control type. Most of the time this is the same as the selector */
  private controlType!: string;

  private labelTextSubscription!: Subscription;

  private initialized = false;

  constructor() {
    effect(() => {
      this._labelChild(); // to trigger the effect
      untracked(() => this.updateLabel());
    });
  }

  #lazyDummyMatformFieldControl = new Lazy<DummyMatFormFieldControl>(() => new DummyMatFormFieldControl(null, null));
  public ngAfterContentChecked(): void {
    if (this.initialized) {
      return;
    }
    // Slider is not initialized the first time we enter this method, therefore we need to check if it got initialized already or not
    const formControl = this.formControl();
    if (formControl) {
      this.initialized = true;
    }

    const matFormFieldControl = this.matFormFieldControl();
    if (matFormFieldControl instanceof DummyMatFormFieldControl) {
      matFormFieldControl.init(this._ngControl() ?? null, formControl);
    }
    this._matFormField()._control = matFormFieldControl;

    // This tells the mat-input that it is inside a mat-form-field
    if ((matFormFieldControl as MatInput)._isInFormField !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (matFormFieldControl as any)._isInFormField = true;
    }

    this.realFormControl = getRealFormControl(this._ngControl(), matFormFieldControl);
    this.controlType = this.formsService.getControlType(this.realFormControl) || 'unknown';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this._elementRef.nativeElement.classList.add(`zv-form-field-type-${this.controlType}`);

    if (this.floatLabel() === 'auto' && (this.emulated || this.realFormControl.shouldLabelFloat === undefined)) {
      this.floatLabel.set('always');
    }

    if (formControl) {
      if (this.formsService.tryDetectRequired) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (matFormFieldControl as any).required = hasRequiredField(formControl);
      }

      this.errors$ = this.formsService.getControlErrors(formControl);

      this.updateLabel();
    }
  }

  public ngOnDestroy(): void {
    const matFormFieldControl = this.matFormFieldControl();
    if (matFormFieldControl instanceof DummyMatFormFieldControl) {
      matFormFieldControl.ngOnDestroy();
    }

    if (this.labelTextSubscription) {
      this.labelTextSubscription.unsubscribe();
    }
  }

  public toggleHint(event: MouseEvent) {
    this.showHint.set(!this.showHint());
    event.stopPropagation();
  }

  private updateLabel() {
    if (this.isServer || !this.initialized) {
      return;
    }
    this.calculatedLabel.set(null);
    if (!this.createLabel() || this._labelChild() || !this.formControl()) {
      return;
    }

    const labelText$ = this.formsService.getLabel(this.formControl()!);
    if (!labelText$) {
      return;
    }

    if (this.labelTextSubscription) {
      this.labelTextSubscription.unsubscribe();
    }
    this.labelTextSubscription = labelText$.subscribe((label) => {
      if (this.controlType.startsWith('mat-mdc-checkbox')) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const labelNode = this._elementRef.nativeElement.querySelectorAll('label')[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        if (!labelNode.innerText.trim()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (labelNode.childNodes.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            labelNode.childNodes.nodeValue = label;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            labelNode.appendChild(document.createTextNode(label));
          }
        }
      } else {
        this.calculatedLabel.set(label);
      }

      // when only our own component is marked for check, then the label will not be shown
      // when labelText$ didn't run synchronously
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (this._matFormField() as any)._changeDetectorRef.markForCheck();
    });
  }
}

function getRealFormControl(
  ngControl: NgControl | null | undefined,
  matFormFieldControl: MatFormFieldControl<unknown>
): { noUnderline?: boolean; shouldLabelFloat?: boolean } {
  if (!(matFormFieldControl instanceof DummyMatFormFieldControl) || !ngControl) {
    return matFormFieldControl;
  }
  return ngControl.valueAccessor as unknown as { noUnderline?: boolean; shouldLabelFloat?: boolean };
}

class Lazy<T> {
  #instance: T | undefined;
  get val(): T {
    return this.#instance ?? (this.#instance = this.creator());
  }
  constructor(private creator: () => T) {}
}
