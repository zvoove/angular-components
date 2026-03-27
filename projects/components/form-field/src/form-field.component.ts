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
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
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

function applyConfigDefaults(config: ZvFormFieldConfig | null): {
  subscriptType: ZvFormFieldSubscriptType;
  hintToggle: boolean;
  requiredText: string | null;
} {
  return {
    hintToggle: config?.hintToggle ?? false,
    subscriptType: config?.subscriptType ?? 'resize',
    requiredText: config?.requiredText ?? null,
  };
}

@Component({
  selector: 'zv-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatFormField, MatLabel, MatPrefix, MatSuffix, MatIconButton, MatIcon, MatError, AsyncPipe],
  host: {
    '[class.zv-form-field--subscript-resize]': 'autoResizeHintError()',
  },
})
export class ZvFormField implements AfterContentChecked, OnDestroy {
  private _elementRef = inject(ElementRef);
  private formsService = inject(ZvFormService);
  private defaults = applyConfigDefaults(inject(ZV_FORM_FIELD_CONFIG, { optional: true }));
  private matDefaults = inject(MAT_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });

  public readonly createLabel = input(true);
  public readonly hint = input('');
  public readonly floatLabel = input<FloatLabelType>(this.matDefaults?.floatLabel || 'auto');
  public readonly subscriptType = input<ZvFormFieldSubscriptType>(this.defaults.subscriptType ?? 'resize');
  public readonly hintToggle = input<boolean | null>(null);

  public readonly _matFormField = viewChild.required(MatFormField);

  /** We can get the FromControl from this */
  public readonly _ngControl = contentChild(NgControl);

  /** The MatFormFieldControl or null, if it is no MatFormFieldControl */
  public readonly _control = contentChild(MatFormFieldControl);

  /** The MatLabel, if it is set or null */
  public readonly labelChild = contentChild(MatLabel);
  public _labelChild: MatLabel | null = null;

  public readonly _prefixChildren = contentChildren(MatPrefix);
  public readonly _suffixChildren = contentChildren(MatSuffix);

  public readonly autoResizeHintError = computed(() => this.subscriptType() === 'resize');

  // mat-form-field childs, that we dont support:
  // @ContentChild(MatPlaceholder) _placeholderChild: MatPlaceholder; // Deprecated, placeholder attribute of the form field control should be used instead!
  // @ContentChildren(MatError) public _errorChildren: QueryList<MatError>; // Will be created automatically
  // @ContentChildren(MatHint) public _hintChildren: QueryList<MatHint>; // No idea how to make this work...

  public get hintToggleOptionActive(): boolean {
    const toggle = this.hintToggle();
    return typeof toggle === 'boolean' ? toggle : this.defaults.hintToggle;
  }

  public get showHintToggle(): boolean {
    return !!this.hint() && this.hintToggleOptionActive;
  }

  public get hintText(): string {
    const hintShouldBeShown = this.showHint || !this.hintToggleOptionActive;

    if (!hintShouldBeShown) {
      return '';
    }

    const control = this._control();
    const isRequired = control?.required;
    const isDisabled = control?.disabled;
    if (!isRequired || isDisabled) {
      return this.hint();
    }

    const requiredText = this.defaults?.requiredText;
    return [requiredText, this.hint()].filter((s) => !!s).join('. ');
  }

  /** The error messages to show */
  public errors$: Observable<IZvFormError[]> = of([]);

  /** Indicates if the control is no real MatFormFieldControl */
  public emulated = false;

  /** Hide the underline for the control */
  public noUnderline = false;
  public showHint = false;
  public calculatedLabel: string | null = null;

  /** Mutable override for floatLabel when emulated controls need 'always' */
  public _floatLabelOverride: FloatLabelType | null = null;

  /** Resolved float label: override takes precedence over input */
  public get resolvedFloatLabel(): FloatLabelType {
    return this._floatLabelOverride ?? this.floatLabel();
  }

  private formControl: FormControl | null = null;

  /** Either the MatFormFieldControl or a DummyMatFormFieldControl */
  private matFormFieldControl!: MatFormFieldControl<unknown>;

  /** The real control instance (MatSlider, MatSelect, MatCheckbox, ...) */
  private realFormControl!: { noUnderline?: boolean; shouldLabelFloat?: boolean };

  /** The control type. Most of the time this is the same as the selector */
  private controlType!: string;

  private labelTextSubscription!: Subscription;

  private initialized = false;

  private isServer = isPlatformServer(inject(PLATFORM_ID));

  constructor() {
    // Replace labelChild setter — track contentChild and run side effects
    effect(() => {
      const label = this.labelChild();
      this._labelChild = label ?? null;
      untracked(() => {
        this.updateLabel();
        const matFormField = this._matFormField();
        if (matFormField) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- accessing Angular Material internal _changeDetectorRef
          (matFormField as any)._changeDetectorRef.markForCheck();
        }
      });
    });

    // Replace ngOnChanges — track hintToggle input
    effect(() => {
      this.hintToggle();
      untracked(() => {
        this.showHint = !this.hintToggleOptionActive;
      });
    });
  }

  public ngAfterContentChecked(): void {
    if (this.initialized) {
      return;
    }
    const ngControl = this._ngControl();
    const control = this._control();
    this.formControl = ngControl ? (ngControl.control as FormControl) : null;
    // Slider is not initialized the first time we enter this method, therefore we need to check if it got initialized already or not
    if (this.formControl) {
      this.initialized = true;
    }
    // We hope noone subscribed matFormFieldControl.stateChanges already - 🤞
    if (this.matFormFieldControl instanceof DummyMatFormFieldControl) {
      this.matFormFieldControl.ngOnDestroy();
    }
    this.matFormFieldControl = control || new DummyMatFormFieldControl(ngControl ?? null, this.formControl);
    this._matFormField()._control = this.matFormFieldControl;
    this.emulated = this.matFormFieldControl instanceof DummyMatFormFieldControl;
    // This tells the mat-input that it is inside a mat-form-field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- accessing Angular Material internal _isInFormField
    if ((this.matFormFieldControl as any)._isInFormField !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- accessing Angular Material internal _isInFormField
      (this.matFormFieldControl as any)._isInFormField = true;
    }
    this.realFormControl = getRealFormControl(ngControl, this.matFormFieldControl);
    this.controlType = this.formsService.getControlType(this.realFormControl) || 'unknown';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this._elementRef.nativeElement.classList.add(`zv-form-field-type-${this.controlType}`);

    this.noUnderline = this.emulated || !!this.realFormControl.noUnderline;
    if (this.floatLabel() === 'auto' && (this.emulated || this.realFormControl.shouldLabelFloat === undefined)) {
      this._floatLabelOverride = 'always';
    }

    if (this.formControl) {
      if (this.formsService.tryDetectRequired) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- dynamically setting required on MatFormFieldControl
        (this.matFormFieldControl as any).required = hasRequiredField(this.formControl);
      }

      this.errors$ = this.formsService.getControlErrors(this.formControl);

      this.updateLabel();
    }
  }

  public ngOnDestroy(): void {
    if (this.matFormFieldControl instanceof DummyMatFormFieldControl) {
      this.matFormFieldControl.ngOnDestroy();
    }

    if (this.labelTextSubscription) {
      this.labelTextSubscription.unsubscribe();
    }
  }

  public toggleHint(event: MouseEvent) {
    this.showHint = !this.showHint;
    event.stopPropagation();
  }

  private updateLabel() {
    if (this.isServer) {
      return;
    }
    this.calculatedLabel = null;
    if (!this.createLabel() || this._labelChild || !this.formControl) {
      return;
    }

    const labelText$ = this.formsService.getLabel(this.formControl);
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
        if (!labelNode.textContent.trim()) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (labelNode.childNodes.length === 1 && labelNode.childNodes[0].nodeType === Node.TEXT_NODE) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            labelNode.childNodes[0].nodeValue = label;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            labelNode.appendChild(document.createTextNode(label));
          }
        }
      } else {
        this.calculatedLabel = label;
      }

      // when only our own component is marked for check, then the label will not be shown
      // when labelText$ didn't run synchronously
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- accessing Angular Material internal _changeDetectorRef
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
