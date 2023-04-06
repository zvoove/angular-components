import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-slider-demo',
  templateUrl: './slider-demo.component.html',
  styleUrls: ['./slider-demo.component.scss'],
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
    return `<zv-slider [isRange]="${this.isRange}" [min]="${this.min}" [max]="${this.max}" [stepSize]="${
      this.stepSize
    }" [connect]="${JSON.stringify(this.connect)}" [showTooltip]="${this.showTooltip}" [disabled]="${
      this.disabled
    }" ${valueBinding}></zv-slider>`;
  }
}
