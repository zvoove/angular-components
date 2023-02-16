import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { API } from 'nouislider';
import { ZvSliderComponent } from './slider.component';
import { ZvSliderModule } from './slider.module';

@Component({
  selector: 'zv-slider-test-blank-implemented',
  template: `
    <zv-slider [min]="min" [max]="max" [stepSize]="stepSize" [(value)]="testValue" [isRange]="isRange" [disabled]="disabled"></zv-slider>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SliderNgModelBlankImplementedComponent {
  @ViewChild(ZvSliderComponent, { static: true }) slider: ZvSliderComponent;
  public testValue: number | number[] = 0;
  public disabled = false;
  public stepSize = 1;
  public min = 0;
  public max = 15;
  public isRange = false;
}

@Component({
  selector: 'zv-slider-test-ngmodel',
  template: ` <zv-slider [min]="0" [max]="15" [(ngModel)]="testValue"></zv-slider> `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SliderNgModelTestComponent {
  @ViewChild(ZvSliderComponent, { static: true }) slider: ZvSliderComponent;
  public testValue = 0;
}

@Component({
  selector: 'zv-slider-test-reactive-form',
  template: `
    <form [formGroup]="form">
      <zv-slider [min]="0" [max]="15" [formControlName]="'control'"></zv-slider>
    </form>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SliderReactiveFormTestComponent {
  @ViewChild(ZvSliderComponent) slider: ZvSliderComponent;

  public formControl = new FormControl(null);
  public form = new FormGroup({
    control: this.formControl,
  });
}

describe('ZvSlider', () => {
  describe('no form', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ZvSliderModule],
        declarations: [SliderNgModelBlankImplementedComponent],
      });
    }));

    describe('range mode', () => {
      it('should not throw for null value', waitForAsync(() => {
        const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
        const component = fixture.componentInstance;

        component.isRange = true;
        component.testValue = null;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.slider.value).toEqual([0, 0]);
          expect(getNoUiSlider(component.slider).get()).toEqual(['0', '0']);
        });
      }));

      it('should work with keyboard', waitForAsync(() => {
        const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
        const component = fixture.componentInstance;

        component.isRange = true;
        component.testValue = [5, 10];
        fixture.detectChanges();

        const handleEls = getHandles(fixture);
        handleEls[0].dispatchEvent(createArrowLeftEvent());
        handleEls[1].dispatchEvent(createArrowRightEvent());
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.slider.value).toEqual([4, 11]);
          expect(getNoUiSlider(component.slider).get()).toEqual(['4', '11']);
        });
      }));

      it('should not allow crossing handles', waitForAsync(() => {
        const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
        const component = fixture.componentInstance;

        component.isRange = true;
        component.testValue = [5, 5];
        fixture.detectChanges();

        const handleEls = getHandles(fixture);
        handleEls[0].dispatchEvent(createArrowRightEvent());
        handleEls[1].dispatchEvent(createArrowLeftEvent());
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(component.slider.value).toEqual([5, 5]);
          expect(getNoUiSlider(component.slider).get()).toEqual(['5', '5']);
        });
      }));
    });

    it('should create with given values', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
      const component = fixture.componentInstance;

      component.testValue = 5;
      fixture.detectChanges();

      expect(component.slider.min).toEqual(0);
      expect(component.slider.max).toEqual(15);
      expect(component.slider.value).toEqual(5);
      expect(getNoUiSlider(component.slider).get()).toEqual('5');
    }));

    it('should respect min when sliding with the keyboard', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
      const component = fixture.componentInstance;

      component.testValue = 5;
      component.min = 5;
      fixture.detectChanges();

      const handleEl = getHandle(fixture);
      handleEl.dispatchEvent(createArrowLeftEvent());
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.slider.value).toEqual(5);
        expect(getNoUiSlider(component.slider).get()).toEqual('5');
      });
    }));

    it('should respect max when sliding with the keyboard', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
      const component = fixture.componentInstance;

      component.testValue = 5;
      component.max = 5;
      fixture.detectChanges();

      const handleEl = getHandle(fixture);
      handleEl.dispatchEvent(createArrowRightEvent());
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.slider.value).toEqual(5);
        expect(getNoUiSlider(component.slider).get()).toEqual('5');
      });
    }));

    it('should respect step size when sliding with the keyboard', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
      const component = fixture.componentInstance;

      component.testValue = 6;
      component.stepSize = 2;
      fixture.detectChanges();

      const handleEl = getHandle(fixture);
      handleEl.dispatchEvent(createArrowLeftEvent());
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.slider.value).toEqual(4);
        expect(getNoUiSlider(component.slider).get()).toEqual('4');
      });
    }));

    it('should block value changes from user when disabled', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
      const component = fixture.componentInstance;

      component.testValue = 5;
      component.disabled = true;
      fixture.detectChanges();

      const handleEl = getHandle(fixture);
      handleEl.dispatchEvent(createArrowLeftEvent());
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.slider.value).toEqual(5);
        expect(getNoUiSlider(component.slider).get()).toEqual('5');
      });
    }));
  });

  describe('NgModel', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, FormsModule, ZvSliderModule, FormsModule],
        declarations: [SliderNgModelTestComponent],
      });
    }));

    it('should update internal value when ngmodel changes', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelTestComponent);
      const component = fixture.componentInstance;

      component.testValue = 5;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.slider.value).toEqual(5);
        expect(getNoUiSlider(component.slider).get()).toEqual('5');

        component.testValue = 10;
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(component.slider.value).toEqual(10);
          expect(getNoUiSlider(component.slider).get()).toEqual('10');
        });
      });
    }));

    it('should update ngmodel when slider changes', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderNgModelTestComponent);
      const component = fixture.componentInstance;
      component.testValue = 5;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const handleEl = getHandle(fixture);
        handleEl.dispatchEvent(createArrowLeftEvent());
        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(component.testValue).toEqual(4);
        });
      });
    }));
  });

  describe('FormControl', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, ReactiveFormsModule, ZvSliderModule],
        declarations: [SliderReactiveFormTestComponent],
      });
    });

    it('should update internal value when form changes', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderReactiveFormTestComponent);
      const component = fixture.componentInstance;

      component.formControl.patchValue(5);
      fixture.detectChanges();
      expect(component.slider.value).toEqual(5);
      expect(getNoUiSlider(component.slider).get()).toEqual('5');

      component.formControl.patchValue(10);
      fixture.detectChanges();
      expect(component.slider.value).toEqual(10);
      expect(getNoUiSlider(component.slider).get()).toEqual('10');
    }));

    it('should update form when slider changes', waitForAsync(() => {
      const fixture = TestBed.createComponent(SliderReactiveFormTestComponent);
      const component = fixture.componentInstance;
      component.formControl.patchValue(5);
      fixture.detectChanges();

      const handleEl = getHandle(fixture);
      handleEl.dispatchEvent(createArrowLeftEvent());
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.formControl.value).toEqual(4);
      });
    }));
  });
});

function getNoUiSlider(zvSlider: ZvSliderComponent): API {
  return (zvSlider as any)._slider;
}

function getHandle<T>(fixture: ComponentFixture<T>): HTMLElement {
  return (fixture.debugElement.nativeElement as HTMLElement).querySelector('.noUi-handle');
}

function getHandles<T>(fixture: ComponentFixture<T>): NodeListOf<HTMLElement> {
  return (fixture.debugElement.nativeElement as HTMLElement).querySelectorAll('.noUi-handle');
}

function createArrowLeftEvent() {
  return new KeyboardEvent('keydown', { key: 'ArrowLeft' });
}

function createArrowRightEvent() {
  return new KeyboardEvent('keydown', { key: 'ArrowRight' });
}
