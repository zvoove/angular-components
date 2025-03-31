import { AsyncPipe, isPlatformServer } from '@angular/common';
import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  HostBinding,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  contentChildren,
  inject,
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
})
export class ZvFormField implements OnChanges, AfterContentChecked, OnDestroy {
  private _elementRef = inject(ElementRef);
  private formsService = inject(ZvFormService);
  private defaults = applyConfigDefaults(inject(ZV_FORM_FIELD_CONFIG, { optional: true }));
  private matDefaults = inject(MAT_FORM_FIELD_DEFAULT_OPTIONS, { optional: true });

  @Input() public createLabel = true;
  @Input() public hint = '';
  @Input() public floatLabel: FloatLabelType = this.matDefaults?.floatLabel || 'auto';
  @Input() public subscriptType: ZvFormFieldSubscriptType = (this.defaults ? this.defaults.subscriptType : null) ?? 'resize';
  @Input() public hintToggle: boolean | null = null;

  @ViewChild(MatFormField, { static: true }) public _matFormField!: MatFormField;

  /** We can get the FromControl from this */
  @ContentChild(NgControl) public _ngControl: NgControl | null = null;

  /** The MatFormFieldControl or null, if it is no MatFormFieldControl */
  @ContentChild(MatFormFieldControl) public _control: MatFormFieldControl<unknown> | null = null;

  /** The MatLabel, if it is set or null */
  @ContentChild(MatLabel) public set labelChild(value: MatLabel) {
    this._labelChild = value;
    this.updateLabel();
    if (this._matFormField) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (this._matFormField as any)._changeDetectorRef.markForCheck();
    }
  }
  public _labelChild: MatLabel | null = null;

  public readonly _prefixChildren = contentChildren(MatPrefix);
  public readonly _suffixChildren = contentChildren(MatSuffix);

  @HostBinding('class.zv-form-field--subscript-resize') public get autoResizeHintError() {
    return this.subscriptType === 'resize';
  }

  // mat-form-field childs, that we dont support:
  // @ContentChild(MatPlaceholder) _placeholderChild: MatPlaceholder; // Deprecated, placeholder attribute of the form field control should be used instead!
  // @ContentChildren(MatError) public _errorChildren: QueryList<MatError>; // Will be created automatically
  // @ContentChildren(MatHint) public _hintChildren: QueryList<MatHint>; // No idea how to make this work...

  public get hintToggleOptionActive(): boolean {
    return typeof this.hintToggle === 'boolean' ? this.hintToggle : this.defaults.hintToggle;
  }

  public get showHintToggle(): boolean {
    return !!this.hint && this.hintToggleOptionActive;
  }

  public get hintText(): string {
    const hintShouldBeShown = this.showHint || !this.hintToggleOptionActive;

    if (!hintShouldBeShown) {
      return '';
    }

    const isRequired = this._control?.required;
    const isDisabled = this._control?.disabled;
    if (!isRequired || isDisabled) {
      return this.hint;
    }

    const requiredText = this.defaults?.requiredText;
    return [requiredText, this.hint].filter((s) => !!s).join('. ');
  }

  /** The error messages to show */
  public errors$: Observable<IZvFormError[]> = of([]);

  /** Indicates if the control is no real MatFormFieldControl */
  public emulated = false;

  /** Hide the underline for the control */
  public noUnderline = false;
  public showHint = false;
  public calculatedLabel: string | null = null;

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

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hintToggle) {
      this.showHint = !this.hintToggleOptionActive;
    }
  }

  public ngAfterContentChecked(): void {
    if (this.initialized) {
      return;
    }
    this.formControl = this._ngControl && (this._ngControl.control as FormControl);
    // Slider is not initialized the first time we enter this method, therefore we need to check if it got initialized already or not
    if (this.formControl) {
      this.initialized = true;
    }
    // We hope noone subscribed matFormFieldControl.stateChanges already - 🤞
    if (this.matFormFieldControl instanceof DummyMatFormFieldControl) {
      this.matFormFieldControl.ngOnDestroy();
    }
    this.matFormFieldControl = this._control || new DummyMatFormFieldControl(this._ngControl, this.formControl);
    this._matFormField._control = this.matFormFieldControl;
    this.emulated = this.matFormFieldControl instanceof DummyMatFormFieldControl;
    // This tells the mat-input that it is inside a mat-form-field
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if ((this.matFormFieldControl as any)._isInFormField !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (this.matFormFieldControl as any)._isInFormField = true;
    }
    this.realFormControl = getRealFormControl(this._ngControl, this.matFormFieldControl);
    this.controlType = this.formsService.getControlType(this.realFormControl) || 'unknown';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this._elementRef.nativeElement.classList.add(`zv-form-field-type-${this.controlType}`);

    this.noUnderline = this.emulated || !!this.realFormControl.noUnderline;
    if (this.floatLabel === 'auto' && (this.emulated || this.realFormControl.shouldLabelFloat === undefined)) {
      this.floatLabel = 'always';
    }

    if (this.formControl) {
      if (this.formsService.tryDetectRequired) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    if (!this.createLabel || this._labelChild || !this.formControl) {
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
        this.calculatedLabel = label;
      }

      // when only our own component is marked for check, then the label will not be shown
      // when labelText$ didn't run synchronously
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (this._matFormField as any)._changeDetectorRef.markForCheck();
    });
  }
}

function getRealFormControl(
  ngControl: NgControl | null,
  matFormFieldControl: MatFormFieldControl<unknown>
): { noUnderline?: boolean; shouldLabelFloat?: boolean } {
  if (!(matFormFieldControl instanceof DummyMatFormFieldControl) || !ngControl) {
    return matFormFieldControl;
  }
  return ngControl.valueAccessor as unknown as { noUnderline?: boolean; shouldLabelFloat?: boolean };
}
