import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';

@Component({
  selector: 'app-reference-column',
  template: `
    <ps-form-field [hint]="'hint text asdf foo bar and other things like this'">
      <mat-label>Referenz Column</mat-label>
      <input matInput [(ngModel)]="value" type="text" />
    </ps-form-field>
  `,
})
export class ReferenceColumnComponent {
  public value = '';
}

@Component({
  selector: 'app-form-field-demo',
  template: `
    <div>
      <div>
        <h2>Appearances</h2>
        For more detail please visit
        <a href="https://material.angular.io/components/form-field/overview#form-field-appearance-variants"
          >https://material.angular.io/components/form-field/overview#form-field-appearance-variants</a
        >
        <ps-form-field style="margin: .5em;" [appearance]="'legacy'" [hint]="'hint text'">
          <mat-label>Legacy</mat-label>
          <input matInput type="text" />
        </ps-form-field>
        <ps-form-field style="margin: .5em;" [appearance]="'standard'" [hint]="'hint text'">
          <mat-label>Standard</mat-label>
          <input matInput type="text" />
        </ps-form-field>
        <ps-form-field style="margin: .5em;" [appearance]="'fill'" [hint]="'hint text'">
          <mat-label>Fill</mat-label>
          <input matInput type="text" />
        </ps-form-field>
        <ps-form-field style="margin: .5em;" [appearance]="'outline'" [hint]="'hint text'">
          <mat-label>Outline</mat-label>
          <input matInput type="text" />
        </ps-form-field>

        <h2>No form binding and no hint</h2>
        <ps-form-field>
          <mat-label>Referenz Column</mat-label>
          <input matInput type="text" />
        </ps-form-field>

        <h2>No form binding and no MatFormFieldControl</h2>
        <ps-form-field [hint]="'hint text'">
          <mat-label>Referenz Column</mat-label>
          <input type="text" />
        </ps-form-field>

        <h2>NgModel</h2>
        <ps-form-field [hint]="'hint text'">
          <mat-label>Referenz Column</mat-label>
          <input matInput type="text" [(ngModel)]="value" />
        </ps-form-field>

        <h2>NgModel without MatFormFieldControl</h2>
        <ps-form-field [hint]="'hint text'">
          <mat-label>Referenz Column</mat-label>
          <input type="text" [(ngModel)]="value" />
        </ps-form-field>
      </div>
      <div>
        <h2>Different controls</h2>
        <mat-checkbox [(ngModel)]="disabled" style="margin: .5em;">disabled</mat-checkbox>
        <mat-checkbox [(ngModel)]="customLabel" style="margin: .5em;">custom label</mat-checkbox>
        <mat-checkbox [(ngModel)]="error" style="margin: .5em;">error</mat-checkbox>

        <ul>
          <li>
            Checkbox can't dynamically switch from/to custom label, therefore both are shown separate below.
          </li>
          <li>
            The reference columns are to make sure all controls have the same height and line up correctly.
          </li>
        </ul>
      </div>
      <div
        [formGroup]="form"
        style="display: grid; grid-template-columns: repeat(4, min-content); grid-auto-rows: min-content; grid-gap: 5px;"
      >
        <div>Referenz Column</div>
        <div>Control Column</div>
        <div>Referenz Column</div>
        <div>Control Column</div>
        <div>
          <div *ngFor="let i of ctrlCountNumbers">
            <app-reference-column></app-reference-column>
          </div>
        </div>
        <div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
          <div>
            <ps-form-field hint="hint text" [appearance]="'fill'">
              <mat-label *ngIf="customLabel">Custom Label</mat-label>
              <mat-select formControlName="Select">
                <mat-option [value]="null"><i>keine Auswahl</i></mat-option>
                <mat-option value="item_ok">Ok</mat-option>
                <mat-option value="item_error">Error</mat-option>
              </mat-select>
            </ps-form-field>
          </div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
          <div>
            <ps-form-field hint="hint text">
              <mat-label *ngIf="customLabel">Custom Label</mat-label>
              <mat-icon matPrefix class="app-form-example__icon">home</mat-icon>
              <input matInput formControlName="Prefix_Text" type="text" />
              <mat-icon matSuffix class="app-form-example__icon">phone</mat-icon>
            </ps-form-field>
          </div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
          <div>
            <ps-form-field hint="hint text">
              <mat-label *ngIf="customLabel">Custom Label</mat-label>
              <mat-slider formControlName="Slider"></mat-slider>
            </ps-form-field>
          </div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
        </div>
        <div>
          <div *ngFor="let i of ctrlCountNumbers">
            <app-reference-column></app-reference-column>
          </div>
        </div>
        <div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
          <div>
            <ps-form-field hint="hint text">
              <mat-checkbox formControlName="Checkbox"></mat-checkbox>
            </ps-form-field>
          </div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
          <div>
            <ps-form-field hint="hint text">
              <mat-checkbox formControlName="Checkbox">{{ asyncLabel$ | async }}</mat-checkbox>
            </ps-form-field>
          </div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
          <div>
            <ps-form-field hint="hint text">
              <mat-label *ngIf="customLabel">Custom Label</mat-label>
              <mat-radio-group formControlName="Radio" style="display: flex;place-content: end space-between;">
                <mat-radio-button [value]="true" style="padding-right: 8px;">Ja</mat-radio-button>
                <mat-radio-button [value]="false" style="padding-right: 8px;">Nein</mat-radio-button>
                <button
                  mat-icon-button
                  [disabled]="form.get('Radio').disabled || form.get('Radio').value === null"
                  (click)="form.get('Radio').patchValue(null)"
                  style="height:20px;width:20px;line-height:20px"
                >
                  <mat-icon style="line-height: 20px;">clear</mat-icon>
                </button>
              </mat-radio-group>
            </ps-form-field>
          </div>
          <div>
            <app-reference-column></app-reference-column>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldDemoComponent {
  public asyncLabel$ = of('Custom Label');
  public ctrlCountNumbers = Array(7).fill(1);
  public value = '';
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) {
    for (const ctrlName in this.form.controls) {
      if (!this.form.controls.hasOwnProperty(ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName];
      if (value) {
        ctrl.disable();
      } else {
        ctrl.enable();
      }
    }
    this._disabled = value;
    this.cd.markForCheck();
  }
  public customLabel = true;
  public get error(): boolean {
    return this._error;
  }
  public set error(value: boolean) {
    for (const ctrlName in this.form.controls) {
      if (!this.form.controls.hasOwnProperty(ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName];
      if (value) {
        ctrl.setValidators(() => ({
          error1: 'error value 1',
          error2: 'this is a very long error is will be truncated in this demo',
        }));
      } else {
        ctrl.setValidators(null);
      }
      ctrl.updateValueAndValidity();
    }
    this._error = value;
    this.cd.markForCheck();
  }

  public form = new FormGroup({
    Text: new FormControl(''),
    Select: new FormControl(''),
    Checkbox: new FormControl(''),
    Radio: new FormControl(''),
    Prefix_Text: new FormControl(''),
    Slider: new FormControl(''),
  });

  private _disabled = false;
  private _error = false;

  constructor(private cd: ChangeDetectorRef) {
    for (const ctrlName in this.form.controls) {
      if (!this.form.controls.hasOwnProperty(ctrlName)) {
        continue;
      }
      const ctrl = this.form.controls[ctrlName];
      (ctrl as any).psLabel = ctrlName;
    }
  }
}
