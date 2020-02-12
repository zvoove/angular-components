import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  InjectionToken,
  Inject,
  Optional,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { FloatLabelType } from '@angular/material/core';
import { MatFormField, MatFormFieldAppearance, MatFormFieldControl, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { hasRequiredField, IPsFormError, PsFormService } from '@prosoft/components/form-base';
import { Observable, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DummyMatFormFieldControl } from './dummy-mat-form-field-control';

export declare type PsFormFieldSubscriptType = 'bubble' | 'resize' | 'single-line';

export interface PsFormFieldConfig {
  subscriptType?: PsFormFieldSubscriptType;
  hintToggle?: boolean;
}

export const PS_FORM_FIELD_CONFIG = new InjectionToken<PsFormFieldConfig>('PS_FORM_FIELD_CONFIG');

@Component({
  selector: 'ps-form-field',
  template: `
    <mat-form-field
      style="width: 100%;"
      [class.mat-form-field--emulated]="emulated"
      [class.mat-form-field--no-underline]="noUnderline"
      [floatLabel]="floatLabel"
      [hintLabel]="visibleHint"
      [appearance]="appearance"
    >
      <mat-label *ngIf="_labelChild">
        <ng-content select="mat-label"></ng-content>
      </mat-label>
      <mat-label *ngIf="!_labelChild && calculatedLabel">
        <mat-label>{{ calculatedLabel }}</mat-label>
      </mat-label>
      <ng-container matPrefix *ngIf="_prefixChildren.length">
        <ng-content select="[matPrefix]"></ng-content>
      </ng-container>
      <ng-content></ng-content>
      <ng-container matSuffix *ngIf="_suffixChildren.length">
        <ng-content select="[matSuffix]"></ng-content>
      </ng-container>
      <button mat-icon-button matSuffix (click)="toggleHint($event)" *ngIf="showHintToggle">
        <mat-icon>info_outline</mat-icon>
      </button>

      <mat-error *ngFor="let error of errors$ | async">{{ error.errorText }}</mat-error>
    </mat-form-field>
  `,
  styles: [
    `
      .mat-form-field--no-underline .mat-form-field-underline,
      .mat-form-field--no-underline .mat-form-field-ripple {
        background-color: transparent !important;
      }

      .ps-form-field-type-mat-slider mat-slider {
        margin: -8px 0;
        width: 100%;
      }

      ps-form-field .mat-form-field-invalid .mat-checkbox-frame,
      ps-form-field .mat-form-field-invalid .mat-radio-outer-circle,
      ps-form-field .mat-form-field-invalid .mat-slider-thumb {
        border-color: var(--ps-error) !important;
      }

      .ps-form-field-type-mat-radio-group .mat-form-field-infix {
        padding: 0.35em 0;
      }
      .ps-form-field-type-mat-checkbox .mat-form-field-infix {
        padding: 0.25em 0;
      }

      .ps-form-field-type-mat-slider .mat-form-field-infix {
        padding: 0;
      }

      /* Falls für emulated die Schrift rot sein soll:
      .mat-form-field--emulated.mat-form-field-invalid .mat-form-field-wrapper {
        color: var(--ps-error) !important;
      }
      */

      /* Mehrzeilige errors/hints erlauben */
      .ps-form-field--subscript-resize .mat-form-field-underline,
      .ps-form-field--subscript-resize .mat-form-field-subscript-wrapper {
        position: static;
      }
      .ps-form-field--subscript-resize .mat-form-field-wrapper {
        padding-bottom: 0;
      }

      /* hint/error bubble container */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper {
        padding-top: 1.25em !important;
        overflow: visible;
        z-index: 1;
        margin-top: 0.25em;
      }

      /* hint/error bubble */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper > div {
        display: block;
        position: absolute;
        top: 0;
        max-width: 100%;
        box-sizing: border-box;
        bottom: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        background: #fff;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        padding: 0 8px;
        box-shadow: 1px 1px 3px #ccc;
      }

      /* hint bubble position */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper > .mat-form-field-hint-wrapper {
        left: auto;
        right: 0;
      }
      /* error bubble position */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper > div:not(.mat-form-field-hint-wrapper) {
        left: 0;
        right: auto;
      }

      /* hint/error bubble anchor */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper:before {
        content: '';
        position: absolute;
        top: -3px;
        width: 6px;
        height: 6px;
        border-right: none;
        border-bottom: none;
        border-bottom-right-radius: 999px;
        transform: rotate(45deg) skew(-10deg, -10deg);
        z-index: 100;
        border-width: 1px 0 0 1px;
        border-style: solid;
      }

      /* hint bubble anchor position */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper:before {
        left: auto;
        right: 10px;
      }
      /* error bubble anchor position */
      .ps-form-field--error-bubble .mat-form-field-subscript-wrapper:before {
        left: 10px;
        right: auto;
      }

      /* hint bubble colors */
      .ps-form-field--bubble .mat-form-field-subscript-wrapper > div,
      .ps-form-field--bubble .mat-form-field-subscript-wrapper:before {
        border-color: rgba(0, 0, 0, 0.2);
        background-color: #fff;
      }

      /* error bubble colors */
      .ps-form-field--error-bubble .mat-form-field-subscript-wrapper > div,
      .ps-form-field--error-bubble .mat-form-field-subscript-wrapper:before {
        border-color: #f99;
        background-color: #fcc;
      }

      .ps-form-field--bubble .mat-error {
        display: inline;
        color: black;
      }

      .ps-form-field--bubble .mat-hint {
        display: inline;
        color: rgba(0, 0, 0, 0.54);
      }

      .ps-form-field--bubble:hover .mat-form-field-subscript-wrapper > div,
      .ps-form-field--bubble .mat-focused .mat-form-field-subscript-wrapper > div {
        bottom: initial !important;
        white-space: initial;
      }

      .ps-form-field--bubble:hover .mat-form-field-subscript-wrapper,
      .ps-form-field--bubble .mat-focused .mat-form-field-subscript-wrapper {
        z-index: 10;
      }

      .ps-form-field--bubble:hover .mat-error,
      .ps-form-field--bubble .mat-focused .mat-error,
      .ps-form-field--bubble:hover .mat-hint,
      .ps-form-field--bubble .mat-focused .mat-hint {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsFormFieldComponent implements OnChanges, AfterContentInit, OnDestroy {
  @Input() public createLabel = true;
  @Input() public floatLabel: FloatLabelType = 'auto';
  @Input() public hint: string = null;
  @Input() public appearance: MatFormFieldAppearance = 'legacy';
  @Input() public subscriptType: PsFormFieldSubscriptType = this.defaults ? this.defaults.subscriptType : 'resize';
  @Input() public hintToggle: boolean | null = null;

  @ViewChild(MatFormField, { static: true }) public _matFormField: MatFormField;

  /** We can get the FromControl from this */
  @ContentChild(NgControl, { static: false }) public _ngControl: NgControl | null;

  /** The MatFormFieldControl or null, if it is no MatFormFieldControl */
  @ContentChild(MatFormFieldControl, { static: false }) public _control: MatFormFieldControl<any> | null;

  /** The MatLabel, if it is set or null */
  @ContentChild(MatLabel, { static: false }) public set labelChild(value: MatLabel) {
    this._labelChild = value;
    this.updateLabel();
    if (this._matFormField) {
      (<any>this._matFormField)._changeDetectorRef.markForCheck();
    }
  }
  public _labelChild: MatLabel;

  @ContentChildren(MatPrefix) public _prefixChildren: QueryList<MatPrefix>;
  @ContentChildren(MatSuffix) public _suffixChildren: QueryList<MatSuffix>;

  @HostBinding('class.ps-form-field--bubble') public get showBubble() {
    return this.subscriptType === 'bubble' && (!!this.visibleHint || this.hasError);
  }
  @HostBinding('class.ps-form-field--error-bubble') public get showErrorBubble() {
    return this.subscriptType === 'bubble' && this.hasError;
  }
  @HostBinding('class.ps-form-field--subscript-resize') public get autoResizeHintError() {
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

  public get visibleHint(): string | null {
    return this.showHint || !this.hintToggleOptionActive ? this.hint : null;
  }

  /** The error messages to show */
  public errors$: Observable<IPsFormError[]> = of([]);

  /** indicates if the control is no real MatFormFieldControl */
  public emulated = false;

  /** ide the underline for the control */
  public noUnderline = false;
  public showHint = false;
  public calculatedLabel: string = null;

  private formControl: FormControl;

  /** Either the MatFormFieldControl or a DummyMatFormFieldControl */
  private matFormFieldControl: MatFormFieldControl<any>;

  /** The real control instance (MatSlider, MatSelect, MatCheckbox, ...) */
  private realFormControl: any;

  /** The control type. Most of the time this is the same as the selector */
  private controlType: string;

  private hasError = false;

  private labelTextSubscription: Subscription;

  constructor(
    private _elementRef: ElementRef,
    private formsService: PsFormService,
    @Optional() @Inject(PS_FORM_FIELD_CONFIG) private defaults?: PsFormFieldConfig
  ) {
    if (!this.defaults) {
      this.defaults = {
        hintToggle: false,
        subscriptType: 'resize',
      };
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.hintToggle) {
      this.showHint = !this.hintToggleOptionActive;
    }
  }

  public ngAfterContentInit(): void {
    this.formControl = this._ngControl && (this._ngControl.control as FormControl);
    this.matFormFieldControl = this._control || new DummyMatFormFieldControl(this._ngControl, this.formControl);
    this._matFormField._control = this.matFormFieldControl;
    this.emulated = this.matFormFieldControl instanceof DummyMatFormFieldControl;
    this.realFormControl = getRealFormControl(this._ngControl, this.matFormFieldControl);

    this.controlType = this.formsService.getControlType(this.realFormControl) || 'unknown';
    this._elementRef.nativeElement.classList.add(`ps-form-field-type-${this.controlType}`);

    this.noUnderline = this.emulated || !!this.realFormControl.noUnderline;
    if (this.floatLabel === 'auto' && (this.emulated || this.realFormControl.shouldLabelFloat === undefined)) {
      this.floatLabel = 'always';
    }

    if (this.formControl) {
      if (this.formsService.tryDetectRequired) {
        (<any>this.matFormFieldControl).required = hasRequiredField(this.formControl);
      }

      this.errors$ = this.formsService.getControlErrors(this.formControl).pipe(
        tap(errors => {
          this.hasError = !!errors.length;
        })
      );

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
    this.labelTextSubscription = labelText$.subscribe(label => {
      if (this.controlType.startsWith('mat-checkbox')) {
        const labelNode = this._elementRef.nativeElement.querySelectorAll('.mat-checkbox-label')[0];
        if (!labelNode.innerText.trim()) {
          if (labelNode.childNodes.length === 1) {
            labelNode.appendChild(document.createTextNode(label));
          } else {
            labelNode.childNodes[1].nodeValue = label;
          }
        }
      } else {
        this.calculatedLabel = label;
      }

      // when only our own component is marked for check, then the label will not be shown
      // when labelText$ didn't run synchronously
      (<any>this._matFormField)._changeDetectorRef.markForCheck();
    });
  }
}

function getRealFormControl(ngControl: NgControl, matFormFieldControl: MatFormFieldControl<any>): any {
  if (!(matFormFieldControl instanceof DummyMatFormFieldControl) || !ngControl) {
    return matFormFieldControl;
  }
  return ngControl.valueAccessor;
}
