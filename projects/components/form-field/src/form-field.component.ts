import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  HostBinding,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { QueryList } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import {
  FloatLabelType,
  MatFormField,
  MatFormFieldAppearance,
  MatFormFieldControl,
  MatFormFieldDefaultOptions,
  MatLabel,
  MatPrefix,
  MatSuffix,
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
} from '@angular/material/form-field';
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
      <button type="button" mat-icon-button matSuffix (click)="toggleHint($event)" *ngIf="showHintToggle">
        <mat-icon>info_outline</mat-icon>
      </button>

      <mat-error *ngFor="let error of errors$ | async">{{ error.errorText }}</mat-error>
    </mat-form-field>
  `,
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PsFormFieldComponent implements OnChanges, AfterContentInit, OnDestroy {
  @Input() public createLabel = true;
  @Input() public floatLabel: FloatLabelType = this.matDefaults?.floatLabel || 'auto';
  @Input() public hint: string = null;
  @Input() public appearance: MatFormFieldAppearance = this.matDefaults?.appearance || 'legacy';
  @Input() public subscriptType: PsFormFieldSubscriptType = this.defaults ? this.defaults.subscriptType : 'resize';
  @Input() public hintToggle: boolean | null = null;

  @ViewChild(MatFormField, { static: true }) public _matFormField: MatFormField;

  /** We can get the FromControl from this */
  @ContentChild(NgControl) public _ngControl: NgControl | null;

  /** The MatFormFieldControl or null, if it is no MatFormFieldControl */
  @ContentChild(MatFormFieldControl) public _control: MatFormFieldControl<any> | null;

  /** The MatLabel, if it is set or null */
  @ContentChild(MatLabel) public set labelChild(value: MatLabel) {
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
    @Optional() @Inject(PS_FORM_FIELD_CONFIG) private defaults?: PsFormFieldConfig,
    @Optional() @Inject(MAT_FORM_FIELD_DEFAULT_OPTIONS) private matDefaults?: MatFormFieldDefaultOptions
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
        tap((errors) => {
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
    this.labelTextSubscription = labelText$.subscribe((label) => {
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
