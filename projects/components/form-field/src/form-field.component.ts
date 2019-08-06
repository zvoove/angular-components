import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { FloatLabelType } from '@angular/material/core';
import { MatFormField, MatFormFieldControl, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { Observable, Subscription, of } from 'rxjs';
import { DummyMatFormFieldControl } from './dummy-mat-form-field-control';
import { IPsFormError, PsFormService, hasRequiredField } from '@prosoft/components/form-base';

@Component({
  selector: 'ps-form-field',
  template: `
    <mat-form-field
      style="width: 100%;"
      [class.mat-form-field--emulated]="emulated"
      [class.mat-form-field--no-underline]="noUnderline"
      [floatLabel]="floatLabel"
      [hintLabel]="hint"
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

      .ps-form-field-type-mat-checkbox .mat-form-field-infix,
      .ps-form-field-type-mat-radio-group .mat-form-field-infix {
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsFormFieldComponent implements AfterContentInit, OnDestroy {
  @Input() public createLabel = true;
  @Input() public floatLabel: FloatLabelType = 'auto';
  @Input() public hint: string = null;

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

  // mat-form-field childs, that we dont support:
  // @ContentChild(MatPlaceholder) _placeholderChild: MatPlaceholder; // Deprecated, placeholder attribute of the form field control should be used instead!
  // @ContentChildren(MatError) public _errorChildren: QueryList<MatError>; // Will be created automatically
  // @ContentChildren(MatHint) public _hintChildren: QueryList<MatHint>; // No idea how to make this work...

  /** The error messages to show */
  public errors$: Observable<IPsFormError[]> = of([]);

  /** indicates if the control is no real MatFormFieldControl */
  public emulated = false;

  /** ide the underline for the control */
  public noUnderline = false;
  public calculatedLabel: string = null;

  private formControl: FormControl;

  /** Either the MatFormFieldControl or a DummyMatFormFieldControl */
  private matFormFieldControl: MatFormFieldControl<any>;

  /** The real control instance (MatSlider, MatSelect, MatCheckbox, ...) */
  private realFormControl: any;

  /** The control type. Most of the time this is the same as the selector */
  private controlType: string;

  private labelTextSubscription: Subscription;

  constructor(private _elementRef: ElementRef, private formsService: PsFormService, private cd: ChangeDetectorRef) {}

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
