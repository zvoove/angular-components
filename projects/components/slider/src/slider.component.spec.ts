import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PsSliderComponent } from './slider.component';
import { PsSliderModule } from './slider.module';

@Component({
  selector: 'ps-slider-test-blank-implemented',
  template: `
    <ps-slider [min]="min" [max]="max" [stepSize]="stepSize" [(value)]="testValue" [isRange]="isRange" [disabled]="disabled"></ps-slider>
  `,
})
export class SliderNgModelBlankImplementedComponent {
  @ViewChild(PsSliderComponent, { static: true }) slider: PsSliderComponent;
  public testValue: number | number[] = 0;
  public disabled = false;
  public stepSize = 1;
  public min = 0;
  public max = 15;
  public isRange = false;
}

@Component({
  selector: 'ps-slider-test-ngmodel',
  template: `
    <ps-slider [min]="0" [max]="15" [(ngModel)]="testValue"></ps-slider>
  `,
})
export class SliderNgModelTestComponent {
  @ViewChild(PsSliderComponent, { static: true }) slider: PsSliderComponent;
  public testValue = 0;
}

@Component({
  selector: 'ps-slider-test-reactive-form',
  template: `
    <form [formGroup]="form">
      <ps-slider [min]="0" [max]="15" [formControlName]="'control'"></ps-slider>
    </form>
  `,
})
export class SliderReactiveFormTestComponent {
  @ViewChild(PsSliderComponent, { static: false }) slider: PsSliderComponent;

  public formControl = new FormControl(null);
  public form = new FormGroup({
    control: this.formControl,
  });
}

describe('PsSlider', () => {
  describe('no form', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [PsSliderModule],
        declarations: [SliderNgModelBlankImplementedComponent],
      });
    }));

    describe('range mode', () => {
      it('should not throw for null value', async(() => {
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

      it('should work with keyboard', async(() => {
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

      it('should not allow crossing handles', async(() => {
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

    it('should create with given values', async(() => {
      const fixture = TestBed.createComponent(SliderNgModelBlankImplementedComponent);
      const component = fixture.componentInstance;

      component.testValue = 5;
      fixture.detectChanges();

      expect(component.slider.min).toEqual(0);
      expect(component.slider.max).toEqual(15);
      expect(component.slider.value).toEqual(5);
      expect(getNoUiSlider(component.slider).get()).toEqual('5');
    }));

    it('should respect min when sliding with the keyboard', async(() => {
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

    it('should respect max when sliding with the keyboard', async(() => {
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

    it('should respect step size when sliding with the keyboard', async(() => {
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

    it('should block value changes from user when disabled', async(() => {
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
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, FormsModule, PsSliderModule, FormsModule],
        declarations: [SliderNgModelTestComponent],
      });
    }));

    it('should update internal value when ngmodel changes', async(() => {
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

    it('should update ngmodel when slider changes', async(() => {
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
        imports: [CommonModule, ReactiveFormsModule, PsSliderModule],
        declarations: [SliderReactiveFormTestComponent],
      });
    });

    it('should update internal value when form changes', async(() => {
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

    it('should update form when slider changes', async(() => {
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

function getNoUiSlider(psSlider: PsSliderComponent): noUiSlider.noUiSlider {
  return (psSlider as any)._slider;
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
