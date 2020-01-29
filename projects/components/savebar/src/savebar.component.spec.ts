import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Injectable, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatChipList } from '@angular/material/chips';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IPsSavebarIntlTexts, PsIntlService, PsIntlServiceEn } from '@prosoft/components/core';
import { BasePsFormService, IPsFormError, IPsFormErrorData, PsFormService } from '@prosoft/components/form-base';
import { Observable, of } from 'rxjs';
import { PsSavebarComponent } from './savebar.component';
import { PsSavebarModule } from './savebar.module';

@Injectable()
class TestPsFormService extends BasePsFormService {
  constructor() {
    super();
    this.options.debounceTime = 0;
  }

  public getLabel(formControl: any): Observable<string> | null {
    return formControl.psLabel ? of(formControl.psLabel) : null;
  }
  protected mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]> {
    return of(
      errorData.map(data => ({
        errorText: data.errorKey,
        data: data,
      }))
    );
  }
}

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-savebar
      [form]="form"
      [mode]="mode"
      [canSave]="canSave"
      [canStepFwd]="canStepFwd"
      [canStepBack]="canStepBack"
      [intlOverride]="intlOverride"
      [saveKey]="saveKey"
    >
      <div [formGroup]="form">
        <input type="text" [formControlName]="'input'" />
      </div>

      <ng-container *psSavebarRightContent>
        <button type="button" class="test-savebar-right-content">test button</button>
      </ng-container>
    </ps-savebar>
  `,
})
export class TestComponent {
  public form = new FormGroup({
    input: new FormControl(null, [Validators.required]),
  });
  public mode: 'sticky' | 'fixed' | 'auto' | 'hide' = null;
  public canSave: boolean | null = null;
  public canStepFwd: boolean;
  public canStepBack: boolean;
  public intlOverride: Partial<IPsSavebarIntlTexts>;
  public saveKey: string = null;

  @ViewChild(PsSavebarComponent, { static: true }) savebar: PsSavebarComponent;

  constructor(public cd: ChangeDetectorRef) {}
}

describe('PsSavebarComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CommonModule, ReactiveFormsModule, PsSavebarModule],
      declarations: [TestComponent],
      providers: [{ provide: PsFormService, useClass: TestPsFormService }, { provide: PsIntlService, useClass: PsIntlServiceEn }],
    }).compileComponents();
  }));

  it('should be sticky or fixed depending on the mode', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatCard))).not.toBe(null);

    component.mode = 'hide';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(MatCard))).toBe(null);
  }));

  it('should be sticky or fixed depending on the mode', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    // pristine & untouched
    component.form.markAsPristine();
    component.form.markAsUntouched();

    component.mode = 'fixed';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(false);

    component.mode = 'sticky';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);

    component.mode = 'auto';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(false);

    component.mode = null;
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(false);

    // pristine & touched
    component.form.markAsPristine();
    component.form.markAsTouched();

    component.mode = 'fixed';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(false);

    component.mode = 'sticky';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);

    component.mode = 'auto';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);

    component.mode = null;
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);

    // dirty & untouched
    component.form.markAsDirty();
    component.form.markAsUntouched();

    component.mode = 'fixed';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(false);

    component.mode = 'sticky';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);

    component.mode = 'auto';
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);

    component.mode = null;
    fixture.detectChanges();
    expect(component.savebar.isSticky).toBe(true);
  }));

  it('should handle disabling of the save button', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    // Form valid & pristine
    component.form.markAsPristine();
    component.form.patchValue({ input: 'test' });

    component.canSave = true;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(false);

    component.canSave = false;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(true);

    component.canSave = null;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(true); // form not changed -> disabled

    // Form invalid & pristine
    component.form.markAsPristine();
    component.form.patchValue({ input: null });

    component.canSave = true;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(false);

    component.canSave = false;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(true);

    component.canSave = null;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(true); // form invalid -> disabled

    // Form valid & dirty
    component.form.markAsDirty();
    component.form.patchValue({ input: 'test' });

    component.canSave = true;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(false);

    component.canSave = false;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(true);

    component.canSave = null;
    fixture.detectChanges();
    expect(component.savebar.saveDisabled).toBe(false); // form valid and changed -> enabled
  }));

  it('save button should work', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    // button not visible without subscription
    expect(fixture.debugElement.query(By.css('.ps-savebar__button__save'))).toBe(null);

    // subscription to output should activate the button
    let outputTriggered = false;
    const outputSubscription = component.savebar.save.subscribe(() => {
      outputTriggered = true;
    });
    component.mode = 'fixed'; // change some input to trigger change detection
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('.ps-savebar__button__save')).nativeElement;
    expect(buttonEl).toBeDefined();

    component.canSave = true;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(false);

    component.canSave = false;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(true);

    expect(outputTriggered).toBe(false);
    buttonEl.dispatchEvent(new Event('click'));
    expect(outputTriggered).toBe(true);

    outputSubscription.unsubscribe();
  }));

  it('saveAndClose button should work', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    // button not visible without subscription
    expect(fixture.debugElement.query(By.css('.ps-savebar__button__save-and-close'))).toBe(null);

    // subscription to output should activate the button
    let outputTriggered = false;
    const outputSubscription = component.savebar.saveAndClose.subscribe(() => {
      outputTriggered = true;
    });
    component.mode = 'fixed'; // change some input to trigger change detection
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('.ps-savebar__button__save-and-close')).nativeElement;
    expect(buttonEl).toBeDefined();

    component.canSave = true;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(false);

    component.canSave = false;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(true);

    expect(outputTriggered).toBe(false);
    buttonEl.dispatchEvent(new Event('click'));
    expect(outputTriggered).toBe(true);

    outputSubscription.unsubscribe();
  }));

  it('cancel button should work', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    // button not visible without subscription
    expect(fixture.debugElement.query(By.css('.ps-savebar__button__cancel'))).toBe(null);

    // subscription to output should activate the button
    let outputTriggered = false;
    const outputSubscription = component.savebar.cancel.subscribe(() => {
      outputTriggered = true;
    });
    component.mode = 'fixed'; // change some input to trigger change detection
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('.ps-savebar__button__cancel')).nativeElement;
    expect(buttonEl).toBeDefined();

    expect(outputTriggered).toBe(false);
    buttonEl.dispatchEvent(new Event('click'));
    expect(outputTriggered).toBe(true);

    outputSubscription.unsubscribe();
  }));

  it('prev button should work', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    // button not visible without subscription
    expect(fixture.debugElement.query(By.css('.ps-savebar__button__prev'))).toBe(null);

    // subscription to output should activate the button
    let outputValue = null;
    const outputSubscription = component.savebar.step.subscribe((x: number) => {
      outputValue = x;
    });
    component.mode = 'fixed'; // change some input to trigger change detection
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('.ps-savebar__button__prev')).nativeElement;
    expect(buttonEl).toBeDefined();

    component.canStepBack = true;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(false);

    component.canStepBack = false;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(true);

    expect(outputValue).toBe(null);
    buttonEl.dispatchEvent(new Event('click'));
    expect(outputValue).toBe(-1);

    outputSubscription.unsubscribe();
  }));

  it('next button should work', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    // button not visible without subscription
    expect(fixture.debugElement.query(By.css('.ps-savebar__button__next'))).toBe(null);

    // subscription to output should activate the button
    let outputValue = null;
    const outputSubscription = component.savebar.step.subscribe((x: number) => {
      outputValue = x;
    });
    component.mode = 'fixed'; // change some input to trigger change detection
    fixture.detectChanges();

    const buttonEl = fixture.debugElement.query(By.css('.ps-savebar__button__next')).nativeElement;
    expect(buttonEl).toBeDefined();

    component.canStepFwd = true;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(false);

    component.canStepFwd = false;
    fixture.detectChanges();
    expect(buttonEl.disabled).toBe(true);

    expect(outputValue).toBe(null);
    buttonEl.dispatchEvent(new Event('click'));
    expect(outputValue).toBe(1);

    outputSubscription.unsubscribe();
  }));

  it('should show psSavebarRightContent', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.css('.test-savebar-right-content'));
    expect(matError).not.toBe(null);
  }));

  it('intl should work', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    // No override
    expect(component.savebar.intl).toEqual({
      saveLabel: 'Save',
      saveAndCloseLabel: 'Save & close',
      cancelLabel: 'Cancel',
      prevLabel: 'Previous',
      nextLabel: 'Next',
    });

    // Full override
    component.intlOverride = {
      saveLabel: 's',
      saveAndCloseLabel: 'sac',
      cancelLabel: 'c',
      prevLabel: 'p',
      nextLabel: 'n',
    };
    fixture.detectChanges();

    expect(component.savebar.intl).toEqual({
      saveLabel: 's',
      saveAndCloseLabel: 'sac',
      cancelLabel: 'c',
      prevLabel: 'p',
      nextLabel: 'n',
    });

    // Partial override
    component.intlOverride = {
      saveLabel: 's',
      saveAndCloseLabel: 'sac',
    };
    fixture.detectChanges();

    expect(component.savebar.intl).toEqual({
      saveLabel: 's',
      saveAndCloseLabel: 'sac',
      cancelLabel: 'Cancel',
      prevLabel: 'Previous',
      nextLabel: 'Next',
    });
  }));

  it('should save with ctrl + saveKey', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    component.canSave = true;
    fixture.detectChanges();

    let outputTriggered = false;
    const outputSubscription = component.savebar.save.subscribe(() => {
      outputTriggered = true;
    });

    component.saveKey = null;
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 's' }));
    expect(outputTriggered).toBe(false);

    component.saveKey = 's';
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }));
    expect(outputTriggered).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: false, key: 's' }));
    expect(outputTriggered).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 's' }));
    expect(outputTriggered).toBe(true);
    outputTriggered = false;

    component.saveKey = 'a';
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 's' }));
    expect(outputTriggered).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }));
    expect(outputTriggered).toBe(true);
    outputTriggered = false;

    component.canSave = false;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }));
    expect(outputTriggered).toBe(false);

    outputSubscription.unsubscribe();
  }));

  it('should show form group and form array errors', async(() => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
    fixture.detectChanges();

    const matError = fixture.debugElement.query(By.directive(MatChipList));
    expect(matError).toBe(null);

    component.form = new FormGroup(
      {
        input: new FormControl(),
      },
      [Validators.pattern('test')]
    );
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // wait for the async data
      fixture.detectChanges(); // refresh the template

      const chips = fixture.debugElement.query(By.directive(MatChipList)).nativeElement;
      expect(chips.children.length).toBe(1);
    });
  }));
});
