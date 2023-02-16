import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-number-input-demo',
  template: `
    <mat-card>
      <h1>zv-slider</h1>

      <div class="app-number-input-demo__settings">
        <div class="app-number-input-demo__checkboxes">
          <mat-checkbox [(ngModel)]="disabled" (change)="onDisabledChanged()">disabled</mat-checkbox>
          <mat-checkbox [(ngModel)]="readonly">readonly</mat-checkbox>
          <mat-checkbox [(ngModel)]="required">required</mat-checkbox>
          <mat-checkbox [(ngModel)]="validatorRequired" (change)="onValidatorChange()">required validator</mat-checkbox>
          <mat-checkbox [(ngModel)]="useErrorStateMatcher" (change)="onUseErrorStateMatcherChange()"
            >errorStateMatcher (always invalid)</mat-checkbox
          >
        </div>
        <zv-form-field>
          <mat-label>min value</mat-label>
          <input matInput type="number" [(ngModel)]="min" />
        </zv-form-field>
        <zv-form-field>
          <mat-label>max value</mat-label>
          <input matInput type="number" [(ngModel)]="max" />
        </zv-form-field>
        <zv-form-field>
          <mat-label>step size</mat-label>
          <input matInput type="number" [(ngModel)]="stepSize" />
        </zv-form-field>
        <zv-form-field>
          <mat-label>decimals</mat-label>
          <input matInput type="number" [(ngModel)]="decimals" />
        </zv-form-field>
        <zv-form-field>
          <mat-label>placeholder</mat-label>
          <input matInput type="text" [(ngModel)]="placeholder" />
        </zv-form-field>
        <button type="button" mat-stroked-button (click)="setValues(null)">set values null</button>
        <button type="button" mat-stroked-button (click)="recreate()">recreate slider</button>
      </div>

      <ng-container *ngIf="show">
        <div class="app-number-input-demo__input-block">
          <zv-form-field [hint]="'Value: ' + value">
            <mat-label>value</mat-label>
            <zv-number-input
              [min]="min"
              [max]="max"
              [stepSize]="stepSize"
              [decimals]="decimals"
              [placeholder]="placeholder"
              [required]="required"
              [disabled]="disabled"
              [readonly]="readonly"
              [errorStateMatcher]="errorStateMatcher"
              [(value)]="value"
            ></zv-number-input>
          </zv-form-field>
          Code:
          <pre class="app-number-input-demo__code">{{ getCodeSnippet('value') }}</pre>
        </div>

        <div class="app-number-input-demo__input-block">
          <zv-form-field [hint]="'Value: ' + model">
            <mat-label>ngModel</mat-label>
            <zv-number-input
              [min]="min"
              [max]="max"
              [stepSize]="stepSize"
              [decimals]="decimals"
              [placeholder]="placeholder"
              [required]="required"
              [disabled]="disabled"
              [readonly]="readonly"
              [errorStateMatcher]="errorStateMatcher"
              [(ngModel)]="model"
            ></zv-number-input>
          </zv-form-field>
          Code:
          <pre class="app-number-input-demo__code">{{ getCodeSnippet('ngmodel') }}</pre>
        </div>

        <div class="app-number-input-demo__input-block" [formGroup]="form">
          <zv-form-field [hint]="'Value: ' + form.get('control').value">
            <mat-label>form</mat-label>
            <zv-number-input
              [min]="min"
              [max]="max"
              [stepSize]="stepSize"
              [decimals]="decimals"
              [placeholder]="placeholder"
              [required]="required"
              [disabled]="disabled"
              [readonly]="readonly"
              [errorStateMatcher]="errorStateMatcher"
              formControlName="control"
            ></zv-number-input>
          </zv-form-field>
          Code:
          <pre class="app-number-input-demo__code">{{ getCodeSnippet('form') }}</pre>
        </div>
      </ng-container>
    </mat-card>
  `,
  styles: [
    `
      .app-number-input-demo__settings {
        margin-bottom: 2em;
      }
      .app-number-input-demo__checkboxes {
        display: flex;
      }
      .app-number-input-demo__checkboxes mat-checkbox {
        margin-right: 1em;
      }
      .app-number-input-demo__input-block {
        border: 1px solid #ccc;
        margin: 0.5em 0;
        padding: 1em;
      }
      .app-number-input-demo__code {
        margin-bottom: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputDemoComponent {
  public value = 5;
  public model = 5;
  public control = new FormControl(5);
  public form = new FormGroup({
    control: this.control,
  });

  public show = true;

  public min = 0;
  public max = 20;
  public stepSize = 1;
  public decimals = 1;
  public placeholder = '';
  public required = false;
  public disabled = false;
  public readonly = false;
  public errorStateMatcher: ErrorStateMatcher = null;

  public validatorRequired = false;
  public useErrorStateMatcher = false;

  constructor(private cd: ChangeDetectorRef) {}

  public onValidatorChange() {
    const validators = [];
    if (this.validatorRequired) {
      validators.push(Validators.required);
    }
    this.control.setValidators(validators);
  }

  public onUseErrorStateMatcherChange() {
    if (this.useErrorStateMatcher) {
      this.errorStateMatcher = {
        isErrorState: () => true,
      };
    } else {
      this.errorStateMatcher = null;
    }
  }

  public setValues(value: number) {
    this.value = value;
    this.model = value;
    this.control.patchValue(value);
  }

  public onDisabledChanged() {
    if (this.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  public recreate() {
    this.show = false;
    setTimeout(() => {
      this.show = true;
      this.cd.markForCheck();
    });
  }

  public getCodeSnippet(type: 'value' | 'ngmodel' | 'form') {
    let valueBinding;
    if (type === 'value') {
      valueBinding = '[(value)]="value"';
    } else if (type === 'ngmodel') {
      valueBinding = '[(ngModel)]="value"';
    } else {
      valueBinding = 'formControlName="control"';
    }
    return `  <zv-number-input
    [min]="${this.min}" [max]="${this.max}" [stepSize]="${this.stepSize}" [decimals]="${this.decimals}"
    [placeholder]="${this.placeholder}" [required]="${this.required}"
    [disabled]="${this.disabled}" [readonly]="${this.readonly}" [errorStateMatcher]="${
      this.errorStateMatcher ? 'errorStateMatcher' : 'null'
    }"
    ${valueBinding}
  ></zv-number-input>`;
  }
}
