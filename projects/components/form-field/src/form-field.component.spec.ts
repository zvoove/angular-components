import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DebugElement, Injectable, inject, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { BaseZvFormService, IZvFormError, IZvFormErrorData, ZvFormService } from '@zvoove/components/form-base';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ZV_FORM_FIELD_CONFIG, ZvFormField, ZvFormFieldSubscriptType } from './form-field.component';

@Injectable({ providedIn: 'root' })
class TestZvFormService extends BaseZvFormService {
  public labelDelay = 0;
  constructor() {
    super();
    this.options.debounceTime = 0;
  }

  public getLabel(formControl: any): Observable<string> | null {
    if (!formControl.zvLabel) {
      return null;
    }
    if (this.labelDelay) {
      return of(formControl.zvLabel).pipe(delay(this.labelDelay));
    }
    return of(formControl.zvLabel);
  }
  protected mapDataToError(errorData: IZvFormErrorData[]): Observable<IZvFormError[]> {
    return of(
      errorData.map((data) => ({
        errorText: data.errorKey,
        data: data,
      }))
    );
  }
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field #f1>
      <input type="text" matInput />
      <mat-label>mat-input</mat-label>
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MatInputModule, ZvFormField],
})
export class TestNoFormComponent {
  readonly formField = viewChild<ZvFormField>('f1');
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field>
      <input type="text" [ngModel]="value()" (ngModelChange)="value.set($event)" matInput />
      <mat-label>test</mat-label>
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, MatInputModule, ZvFormField],
})
export class TestNgModelComponent {
  public readonly cd = inject(ChangeDetectorRef);

  readonly value = signal<any>(null);

  readonly formField = viewChild(ZvFormField);
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field [hint]="hint()" [hintToggle]="hintToggle()" [subscriptType]="subscriptType()">
      @if (customLabel()) {
        <mat-label>{{ customLabel() }}</mat-label>
      }
      <input type="text" [formControl]="formControl" matInput [required]="required()" />
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, MatInputModule, ZvFormField],
})
export class TestFormComponent {
  public readonly cd = inject(ChangeDetectorRef);

  formControl = new FormControl('', [Validators.pattern('pattern'), Validators.minLength(5)]);
  readonly customLabel = signal<string | null>(null);
  readonly hint = signal<string | null>(null);
  readonly subscriptType = signal<ZvFormFieldSubscriptType | null>(null);
  readonly hintToggle = signal(false);
  readonly required = signal(false);

  readonly formField = viewChild(ZvFormField);
}

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-form-field #f1 class="template-label">
      <mat-checkbox [formControl]="formControl">{{ asyncLabel$ | async }}</mat-checkbox>
    </zv-form-field>
    <zv-form-field #f2 class="no-label">
      <mat-checkbox [formControl]="formControl" />
    </zv-form-field>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ReactiveFormsModule, MatCheckboxModule, ZvFormField, AsyncPipe],
})
export class TestCheckboxComponent {
  public readonly cd = inject(ChangeDetectorRef);

  public asyncLabel$ = of('async label');
  formControl = new FormControl('');

  readonly formFieldTemplateLabel = viewChild<ZvFormField>('f1', { static: true });
  readonly formFieldNoLabel = viewChild<ZvFormField>('f2', { static: true });
}

describe('ZvFormField', () => {
  describe('checkbox', () => {
    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [TestCheckboxComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
    });

    it('should set checkbox label if no label is set in the template', async () => {
      const fixture = TestBed.createComponent(TestCheckboxComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      // Set zvLabel before first detectChanges so it's picked up during initialization
      (component.formControl as any).zvLabel = 'service label';
      fixture.detectChanges();
      // Allow async label resolution to settle (multiple cycles for RxJS operators)
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.template-label')).query(By.css('label')).nativeElement.textContent.trim()).toBe(
        'async label'
      );
      expect(fixture.debugElement.query(By.css('.no-label')).query(By.css('label')).nativeElement.textContent.trim()).toBe('service label');
    });
  });

  describe('formControl', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set label', async () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      // Set zvLabel before first detectChanges so it's picked up during initialization
      (component.formControl as any).zvLabel = 'service label';
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(0);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('mat-label')).nativeElement.textContent.trim()).toBe('service label');

      // label defined with <mat-label>
      component.customLabel.set('custom label');
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('mat-label')).nativeElement.textContent.trim()).toBe('custom label');

      // Label calculated from the service with delay
      (component.formControl as any).zvLabel = 'async label';
      (TestBed.inject(ZvFormService) as TestZvFormService).labelDelay = 10;
      // Setting customLabel to null removes the labelChild, which triggers updateLabel()
      component.customLabel.set(null);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(10);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('mat-label')).nativeElement.textContent.trim()).toBe('async label');
    });

    it('should show errors', async () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      component.formControl.setValue('a');
      component.formControl.markAsTouched();
      fixture.detectChanges();

      expect(component.formField()._ngControl()?.invalid).toBe(true);
      expect(component.formField()._matFormField()._control.errorState).toBe(true);

      let errorsChecked = false;
      component.formField().errors$.subscribe((e) => {
        expect(e.map((x) => x.errorText)).toEqual(['pattern', 'minlength']);
        errorsChecked = true;
      });
      await vi.advanceTimersByTimeAsync(1);
      expect(errorsChecked).toBeTruthy();
    });

    it('should work with hint toggle button', async () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();
      component.hintToggle.set(true);
      fixture.detectChanges();

      // no hint -> no hint button
      expect(getHelpButton(fixture)).toBeFalsy();

      // hint -> hint button but initially no hint text
      component.hint.set('myhint');
      fixture.detectChanges();

      const helpButton = getHelpButton(fixture);
      expect(helpButton).toBeTruthy();
      expect(getShownHelpText(fixture)).toBeFalsy();

      // 1. hint button click -> hint text
      helpButton.triggerEventHandler('click', new Event('click'));
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toEqual('myhint');

      // 2. hint button click -> no hint text
      helpButton.triggerEventHandler('click', new Event('click'));
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toBeFalsy();

      // no hint -> no hint button/text
      component.hint.set(null);
      fixture.detectChanges();
      expect(getHelpButton(fixture)).toBeFalsy();
      expect(getShownHelpText(fixture)).toBeFalsy();
    });

    it('should work without hint toggle button', async () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();
      component.hintToggle.set(false);
      fixture.detectChanges();

      // no hint -> no hint button
      expect(getHelpButton(fixture)).toBeFalsy();

      // hint -> hint text but still no hint button
      component.hint.set('myhint');
      fixture.detectChanges();

      const helpButton = getHelpButton(fixture);
      expect(helpButton).toBeFalsy();
      expect(getShownHelpText(fixture)).toEqual('myhint');
    });

    it('should set correct classes for subscriptType', async () => {
      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      component.hintToggle.set(false);
      component.hint.set('hint');
      component.subscriptType.set('single-line');
      fixture.detectChanges();

      let classes = getFormFieldClasses(fixture);
      expect(classes.contains('zv-form-field--subscript-resize')).toBeFalsy();

      component.subscriptType.set('resize');
      fixture.detectChanges();
      classes = getFormFieldClasses(fixture);
      expect(classes.contains('zv-form-field--subscript-resize')).toBeTruthy();
    });
  });

  describe('ngModel', () => {
    let fixture: ComponentFixture<TestNgModelComponent>;
    let loader: HarnessLoader;
    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [TestNgModelComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
      fixture = TestBed.createComponent(TestNgModelComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should work with ngModel', async () => {
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      const formFieldHarness = await loader.getHarness(MatFormFieldHarness);

      expect(component.formField().emulated).toBe(false);
      expect(component.formField().noUnderline).toBe(false);
      expect(await formFieldHarness.isLabelFloating()).toBe(false);

      component.value.set('test');
      fixture.detectChanges();

      expect(await formFieldHarness.isLabelFloating()).toBe(true);
    });
  });

  describe('no form', () => {
    let fixture: ComponentFixture<TestNoFormComponent>;
    let loader: HarnessLoader;
    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [TestNoFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
      fixture = TestBed.createComponent(TestNoFormComponent);
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should work without form binding on matInput', async () => {
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const formFieldHarness = await loader.getHarness(MatFormFieldHarness);

      expect(component.formField().emulated).toBe(false);
      expect(component.formField().noUnderline).toBe(false);
      expect(await formFieldHarness.isLabelFloating()).toBe(false);

      const el = fixture.debugElement.query(By.css('input')).nativeElement;
      el.value = 'someValue';
      el.dispatchEvent(new Event('input'));

      expect(await formFieldHarness.isLabelFloating()).toBe(true);
    });
  });

  describe('initialization', () => {
    it('should initialize properly with its own default settings', async () => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      expect(component.formField().floatLabel()).toEqual('auto');
    });

    it('should priorize MAT_FORM_FIELD_DEFAULT_OPTIONS over its own settings', async () => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [
          { provide: ZvFormService, useClass: TestZvFormService },
          {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { floatLabel: 'always', hideRequiredMarker: false },
          },
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      expect(component.formField().floatLabel()).toEqual('always');
    });
  });

  describe('hint', () => {
    it('should show the right supporting text when ZV_FORM_FIELD_CONFIG.requiredText is set', async () => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [
          { provide: ZvFormService, useClass: TestZvFormService },
          { provide: ZV_FORM_FIELD_CONFIG, useValue: { requiredText: 'foo' } },
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      const assertHintEquals = async (text: string) => {
        fixture.detectChanges();
        expect(getShownHelpText(fixture)).toEqual(text);
      };

      // not required & no hint -> no hint
      await assertHintEquals('');

      // required & no hint & not disabled -> required text in hint
      component.required.set(true);
      await assertHintEquals('foo');

      // required & no hint & disabled -> no hint
      component.formControl.disable();
      await assertHintEquals('');

      component.hint.set('bar');
      // required & hint & disabled -> hint
      await assertHintEquals('bar');

      component.formControl.enable();
      // required & hint & not disabled -> required text and the hint separated by ". "
      await assertHintEquals('foo. bar');

      // not required & hint & not disabled -> only the hint
      component.required.set(false);
      await assertHintEquals('bar');
    });

    it('should show the right supporting text when ZV_FORM_FIELD_CONFIG.requiredText is not set', async () => {
      TestBed.configureTestingModule({
        imports: [TestFormComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();

      const fixture = TestBed.createComponent(TestFormComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();
      fixture.detectChanges();

      // not required & no hint -> no hint
      expect(getShownHelpText(fixture)).toBeFalsy();

      // required & no hint -> no hint
      component.required.set(true);
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toBeFalsy();

      // required & hint -> only the hint
      component.hint.set('dummy');
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toEqual('dummy');

      // not required & hint -> only the hint
      component.required.set(false);
      fixture.detectChanges();
      expect(getShownHelpText(fixture)).toEqual('dummy');
    });
  });
});

function getHelpButton<T>(fixture: ComponentFixture<T>): DebugElement {
  const button = fixture.debugElement.query(By.css('.mdc-icon-button'));
  if (button && button.nativeElement.textContent.indexOf('info_outline') !== -1) {
    return button;
  }
  return null;
}

function getShownHelpText<T>(fixture: ComponentFixture<T>): string {
  const bubble = fixture.debugElement.query(By.css('.mat-mdc-form-field-hint-wrapper'));
  return bubble && bubble.nativeElement.textContent.trim();
}

function getFormFieldClasses<T>(fixture: ComponentFixture<T>): DOMTokenList {
  const node = fixture.debugElement.query(By.directive(ZvFormField));
  if (node) {
    return node.nativeElement.classList;
  }
  return null;
}
