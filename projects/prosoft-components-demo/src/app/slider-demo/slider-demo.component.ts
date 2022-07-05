import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-slider-demo',
  template: `
    <h1>ps-slider</h1>

    <div class="app-slider-demo__settings">
      <div class="app-slider-demo__checkboxes">
        <mat-checkbox [(ngModel)]="disabled" (change)="onDisabledChanged()">disabled</mat-checkbox>
        <mat-checkbox [(ngModel)]="showTooltip">Tooltip</mat-checkbox>
        <mat-checkbox [(ngModel)]="isRange" (change)="onIsRangeChange()">Range</mat-checkbox>
        <mat-checkbox [(ngModel)]="validatorRequired" (change)="onValidatorChange()">required validator</mat-checkbox>
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
        <mat-label>connect</mat-label>
        <mat-select [(ngModel)]="connect" (selectionChange)="recreate()">
          <mat-option [value]="">--</mat-option>
          <ng-container *ngIf="!isRange">
            <mat-option [value]="[false, false]">[false, false]</mat-option>
            <mat-option [value]="[true, false]">[true, false]</mat-option>
            <mat-option [value]="[false, true]">[false, true]</mat-option>
            <mat-option [value]="[true, true]">[true, true]</mat-option>
          </ng-container>
          <ng-container *ngIf="isRange">
            <mat-option [value]="[false, false, false]">[false, false, false]</mat-option>
            <mat-option [value]="[false, true, false]">[false, true, false]</mat-option>
            <mat-option [value]="[true, false, true]">[true, false, true]</mat-option>
          </ng-container>
        </mat-select>
      </ps-form-field>
      <button type="button" mat-stroked-button (click)="setValues(null)">set values null</button>
      <button type="button" mat-stroked-button (click)="recreate()">recreate slider</button>
    </div>

    <ng-container *ngIf="show">
      <div class="app-slider-demo__slider-block">
        <ps-form-field>
          <mat-label>value</mat-label>
          <ps-slider
            [isRange]="isRange"
            [min]="min"
            [max]="max"
            [stepSize]="stepSize"
            [connect]="connect"
            [showTooltip]="showTooltip"
            [(value)]="value"
            [disabled]="disabled"
          ></ps-slider>
          <mat-hint>Value: {{ value }}</mat-hint>
        </ps-form-field>
        Code:
        <pre class="app-slider-demo__code">{{ getCodeSnippet('value') }}</pre>
      </div>

      <div class="app-slider-demo__slider-block">
        <ps-form-field>
          <mat-label>ngModel</mat-label>
          <ps-slider
            [isRange]="isRange"
            [min]="min"
            [max]="max"
            [stepSize]="stepSize"
            [connect]="connect"
            [showTooltip]="showTooltip"
            [(ngModel)]="model"
            [disabled]="disabled"
          ></ps-slider>
          <mat-hint>Value: {{ model }}</mat-hint>
        </ps-form-field>
        Code:
        <pre class="app-slider-demo__code">{{ getCodeSnippet('ngmodel') }}</pre>
      </div>

      <div class="app-slider-demo__slider-block" [formGroup]="form">
        <ps-form-field>
          <mat-label>form</mat-label>
          <ps-slider
            [isRange]="isRange"
            [min]="min"
            [max]="max"
            [stepSize]="stepSize"
            [connect]="connect"
            [showTooltip]="showTooltip"
            formControlName="control"
          ></ps-slider>
          <mat-hint>Value: {{ form.get('control').value }}</mat-hint>
        </ps-form-field>
        Code:
        <pre class="app-slider-demo__code">{{ getCodeSnippet('form') }}</pre>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .app-slider-demo__settings {
        margin-bottom: 2em;
      }
      .app-slider-demo__checkboxes {
        display: flex;
        gap: 1em;
      }
      .app-slider-demo__slider-block {
        border: 1px solid #ccc;
        margin: 0.5em 0;
        padding: 1em;
      }
      .app-slider-demo__code {
        margin-bottom: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDemoComponent {
  public value: number | number[] = 5;
  public model: number | number[] = 5;
  public control = new FormControl(5);
  public form = new FormGroup({
    control: this.control,
  });

  public show = true;

  public disabled = false;
  public isRange = false;
  public showTooltip = false;
  public min = 0;
  public max = 20;
  public stepSize = 1;
  public connect: any = false;

  public validatorRequired = false;

  constructor(private cd: ChangeDetectorRef) {}

  public onValidatorChange() {
    const validators = [];
    if (this.validatorRequired) {
      validators.push(Validators.required);
    }
    this.control.setValidators(validators);
  }

  public setValues(value: any) {
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

  public onIsRangeChange() {
    this.connect = null;
    this.setValues(this.isRange ? [3, 15] : 5);
    this.recreate();
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
    return `<ps-slider [isRange]="${this.isRange}" [min]="${this.min}" [max]="${this.max}" [stepSize]="${
      this.stepSize
    }" [connect]="${JSON.stringify(this.connect)}" [showTooltip]="${this.showTooltip}" [disabled]="${
      this.disabled
    }" ${valueBinding}></ps-slider>`;
  }
}
