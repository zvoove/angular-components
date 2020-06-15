import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-number-input-demo',
  template: `
    <mat-card>
      <h1>ps-slider</h1>

      <div class="app-number-input-demo__settings">
        <div class="app-number-input-demo__checkboxes">
          <mat-checkbox [(ngModel)]="disabled" (change)="onDisabledChanged()">disabled</mat-checkbox>
          <mat-checkbox [(ngModel)]="readonly">readonly</mat-checkbox>
          <mat-checkbox [(ngModel)]="required">required</mat-checkbox>
          <mat-checkbox [(ngModel)]="validatorRequired" (change)="onValidatorChange()">required validator</mat-checkbox>
          <mat-checkbox [(ngModel)]="formatInput">formatInput</mat-checkbox>
          <mat-checkbox [(ngModel)]="useErrorStateMatcher" (change)="onUseErrorStateMatcherChange()"
            >errorStateMatcher (always invalid)</mat-checkbox
          >
        </div>
        <ps-form-field>
          <mat-label>min value</mat-label>
          <input matInput type="number" [(ngModel)]="min" />
        </ps-form-field>
        <ps-form-field>
          <mat-label>max value</mat-label>
          <input matInput type="number" [(ngModel)]="max" />
        </ps-form-field>
        <ps-form-field>
          <mat-label>step size</mat-label>
          <input matInput type="number" [(ngModel)]="stepSize" />
        </ps-form-field>
        <ps-form-field>
          <mat-label>decimals</mat-label>
          <input matInput type="number" [(ngModel)]="decimals" />
        </ps-form-field>
        <ps-form-field>
          <mat-label>placeholder</mat-label>
          <input matInput type="text" [(ngModel)]="placeholder" />
        </ps-form-field>
        <button type="button" mat-stroked-button (click)="setValues(null)">set values null</button>
        <button type="button" mat-stroked-button (click)="recreate()">recreate slider</button>
      </div>

      <ng-container *ngIf="show">
        <div class="app-number-input-demo__input-block">
          <ps-form-field [hint]="'Value: ' + value">
            <mat-label>value</mat-label>
            <ps-number-input
              [min]="min"
              [max]="max"
              [stepSize]="stepSize"
              [decimals]="decimals"
              [formatInput]="formatInput"
              [placeholder]="placeholder"
              [required]="required"
              [disabled]="disabled"
              [readonly]="readonly"
              [errorStateMatcher]="errorStateMatcher"
              [(value)]="value"
            ></ps-number-input>
          </ps-form-field>
          Code:
          <pre class="app-number-input-demo__code">{{ getCodeSnippet('value') }}</pre>
        </div>

        <div class="app-number-input-demo__input-block">
          <ps-form-field [hint]="'Value: ' + model">
            <mat-label>ngModel</mat-label>
            <ps-number-input
              [min]="min"
              [max]="max"
              [stepSize]="stepSize"
              [decimals]="decimals"
              [formatInput]="formatInput"
              [placeholder]="placeholder"
              [required]="required"
              [disabled]="disabled"
              [readonly]="readonly"
              [errorStateMatcher]="errorStateMatcher"
              [(ngModel)]="model"
            ></ps-number-input>
          </ps-form-field>
          Code:
          <pre class="app-number-input-demo__code">{{ getCodeSnippet('ngmodel') }}</pre>
        </div>

        <div class="app-number-input-demo__input-block" [formGroup]="form">
          <ps-form-field [hint]="'Value: ' + form.get('control').value">
            <mat-label>form</mat-label>
            <ps-number-input
              [min]="min"
              [max]="max"
              [stepSize]="stepSize"
              [decimals]="decimals"
              [formatInput]="formatInput"
              [placeholder]="placeholder"
              [required]="required"
              [disabled]="disabled"
              [readonly]="readonly"
              [errorStateMatcher]="errorStateMatcher"
              formControlName="control"
            ></ps-number-input>
          </ps-form-field>
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
  public value: number | number[] = 5;
  public model: number | number[] = 5;
  public control = new FormControl(5);
  public form = new FormGroup({
    control: this.control,
  });

  public show = true;

  public min = 0;
  public max = 20;
  public stepSize = 1;
  public decimals = 1;
  public formatInput = true;
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
        isErrorState: () => {
          return true;
        },
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
    return `  <ps-number-input
    [min]="${this.min}" [max]="${this.max}" [stepSize]="${this.stepSize}" [decimals]="${this.decimals}"
    [formatInput]="${this.formatInput}" [placeholder]="${this.placeholder}" [required]="${this.required}"
    [disabled]="${this.disabled}" [readonly]="${this.readonly}" [errorStateMatcher]="${
      this.errorStateMatcher ? 'errorStateMatcher' : 'null'
    }"
    ${valueBinding}
  ></ps-number-input>`;
  }
}
