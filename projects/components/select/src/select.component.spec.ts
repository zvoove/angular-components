import { ChangeDetectorRef, Component, OnDestroy, Type, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, Subscription } from 'rxjs';
import { DefaultPsSelectDataSource } from './defaults/default-select-data-source';
import { DefaultPsSelectService } from './defaults/default-select-service';
import { PsSelectComponent } from './select.component';
import { PsSelectModule } from './select.module';

function createFakeMatSelect(): MatSelect {
  const matSelect = <any>{
    stateChanges: new Subject<void>(),
    close: () => {},
    setDisabledState: () => {},
    writeValue: () => {},
    _onChange: null,
    _onTouched: null,
  };

  matSelect.registerOnChange = (val: any) => {
    matSelect._onChange = val;
  };
  matSelect.registerOnTouched = (val: any) => {
    matSelect._onTouched = val;
  };

  return matSelect;
}

@Component({
  selector: 'ps-test-component',
  template: `
    <div [formGroup]="form">
      <ps-select
        formControlName="select"
        [dataSource]="dataSource"
        [errorStateMatcher]="errorStateMatcher"
        [panelClass]="panelClass"
        [clearable]="clearable"
      ></ps-select>
    </div>
  `,
})
export class TestComponent implements OnDestroy {
  dataSource = [
    { value: 1, label: 'item1' },
    { value: 2, label: 'item2' },
  ];
  control = new FormControl(null, [Validators.required]);
  form = new FormGroup({
    select: this.control,
  });
  emittedValues: any[] = [];
  errorStateMatcher: ErrorStateMatcher = null;
  panelClass: { [key: string]: boolean } = {};
  clearable = true;

  @ViewChild(PsSelectComponent, { static: true }) select: PsSelectComponent;

  private valuesSubscription: Subscription;
  constructor() {
    this.valuesSubscription = this.form.get('select').valueChanges.subscribe((value) => {
      this.emittedValues.push(value);
    });
  }

  ngOnDestroy() {
    this.valuesSubscription.unsubscribe();
  }
}

@Component({
  selector: 'ps-test-multiple-component',
  template: ` <ps-select [(ngModel)]="value" [dataSource]="dataSource" [multiple]="true" [showToggleAll]="showToggleAll"></ps-select> `,
})
export class TestMultipleComponent {
  showToggleAll = true;
  dataSource: any = [
    { value: 1, label: 'item1' },
    { value: 2, label: 'item2' },
  ];
  value: any = null;

  @ViewChild(PsSelectComponent, { static: true }) select: PsSelectComponent;

  constructor(public cd: ChangeDetectorRef) {}
}

@Component({
  selector: 'ps-test-custom-template',
  template: `
    <ps-select [(ngModel)]="value" [dataSource]="items">
      <ng-container *psSelectTriggerTemplate="let item">
        trigger:{{ item.value }}:<span [style.color]="item.value">{{ item.viewValue }}</span>
      </ng-container>
      <ng-container *psSelectOptionTemplate="let item">
        <div>color:</div>
        <div>{{ item.value }}:</div>
        <div [style.color]="item.value">{{ item.label }}</div>
      </ng-container>
    </ps-select>
  `,
})
export class TestCustomTemplateComponent {
  public items = [
    {
      value: `red`,
      label: `Red`,
    },
    {
      value: `green`,
      label: `Green`,
    },
    {
      value: `blue`,
      label: `Blue`,
    },
  ];
  public value: any = null;
}

async function initTest<T>(type: Type<T>): Promise<{ fixture: ComponentFixture<T>; component: T }> {
  TestBed.configureTestingModule({
    imports: [NoopAnimationsModule, PsSelectModule.forRoot(DefaultPsSelectService), FormsModule, ReactiveFormsModule],
    declarations: [TestComponent, TestMultipleComponent, TestCustomTemplateComponent],
  });
  const fixture = TestBed.createComponent(type);
  const component = fixture.componentInstance;
  expect(component).toBeDefined();

  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  return {
    fixture: fixture,
    component: component,
  };
}

describe('PsSelectComponent', () => {
  it('should use right default values', async () => {
    const cmp = new PsSelectComponent(null, null, null);

    expect(cmp.clearable).toBeTruthy();
    expect(cmp.showToggleAll).toBeTruthy();
  });

  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [PsSelectModule.forRoot(DefaultPsSelectService)],
    });
    const fixture = TestBed.createComponent(PsSelectComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();
  });

  it('should fix MatSelect.close() not emitting stateChanges', fakeAsync(() => {
    const matSelect = createFakeMatSelect();

    const psSelect = new PsSelectComponent(null, null, null);
    psSelect.setMatSelect = matSelect;

    spyOn(matSelect.stateChanges, 'next');

    matSelect.close();

    expect(matSelect.stateChanges.next).toHaveBeenCalled();
  }));

  it('should not enable/disable formControl, if it is already', fakeAsync(() => {
    // formControl enable/disable calls setDisabledState on the valueAccessor, which is the PsSelect -> endless loop
    const psSelect = new PsSelectComponent(null, null, null);
    psSelect.formControl.enable();

    spyOn(psSelect.formControl, 'enable');
    psSelect.setDisabledState(false);
    expect(psSelect.formControl.enable).not.toHaveBeenCalled();

    psSelect.formControl.disable();

    spyOn(psSelect.formControl, 'disable');
    psSelect.setDisabledState(false);
    expect(psSelect.formControl.disable).not.toHaveBeenCalled();
  }));

  it('should work with ngModel', async () => {
    const { fixture, component } = await initTest(TestMultipleComponent);

    // Update value from ps-select
    const options = ((component.select as any)._matSelect as MatSelect).options;
    options.last.select();
    fixture.detectChanges();
    expect(component.value).toEqual([2]);
    expect(getSelectedValueText(fixture)).toEqual('item2');
  });

  it('should emit only once when selecting an option', async () => {
    const { component } = await initTest(TestComponent);

    const options = ((component.select as any)._matSelect as MatSelect).options;

    // select item 2
    options.last.select();
    expect(component.emittedValues).toEqual([2]);

    // select the clear item
    // MatSelect emits this twice, commented out until it is fixed:
    // https://github.com/angular/components/issues/10675
    // https://github.com/angular/components/issues/12267
    // component.emittedValues = [];
    // options.first.select();
    // expect(component.emittedValues).toEqual([undefined]);
  });

  it('should use the error state matcher input', async () => {
    const { fixture, component } = await initTest(TestComponent);

    // Default matcher
    expect(component.control.value).toBe(null);
    expect(component.select.errorState).toBe(false);

    // Custom matcher - empty value
    component.errorStateMatcher = {
      isErrorState: (control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => {
        return !!(control && control.invalid);
      },
    };
    fixture.detectChanges();
    expect(component.select.errorState).toBe(true);

    // Custom matcher - item 1
    component.control.patchValue(1);
    fixture.detectChanges();
    expect(component.select.errorState).toBe(false);
  });

  it('should use clearable input', async () => {
    const { fixture, component } = await initTest(TestComponent);
    component.clearable = true;
    fixture.detectChanges();
    const options = ((component.select as any)._matSelect as MatSelect).options;

    expect(options.find((x) => x.viewValue === '--')).toBeTruthy();

    component.clearable = false;
    fixture.detectChanges();

    expect(options.find((x) => x.viewValue === '--')).toBeFalsy();
  });

  it('toggle all functionality should work', async () => {
    const { fixture, component } = await initTest(TestMultipleComponent);
    component.showToggleAll = true;
    fixture.detectChanges();
    const options = ((component.select as any)._matSelect as MatSelect).options;
    expect(options.map((x) => x.selected).reduce((prev, curr) => prev || curr, false)).toBeFalsy();

    await openMatSelect(fixture);
    let toggleAllCbx = await getToggleAllInputCbx(fixture);
    expect(toggleAllCbx).toBeTruthy();

    toggleAllCbx.click();
    fixture.detectChanges();
    expect(getOptionSelectedValues().reduce((prev, curr) => prev && curr, true)).toBeTruthy();

    toggleAllCbx.click();
    fixture.detectChanges();
    expect(getOptionSelectedValues().reduce((prev, curr) => prev || curr, false)).toBeFalsy();

    options.last.select();
    toggleAllCbx.click();
    fixture.detectChanges();
    expect(getOptionSelectedValues().reduce((prev, curr) => prev && curr, true)).toBeTruthy();

    component.showToggleAll = false;
    fixture.detectChanges();
    toggleAllCbx = await getToggleAllInputCbx(fixture);
    expect(toggleAllCbx).toBeFalsy();

    await closeMatSelect(fixture);

    function getOptionSelectedValues() {
      // Skip the first, as it is the search input wrapped in an option
      return options.map((x) => x.selected).slice(1);
    }
  });

  it('should set the right css classes', async () => {
    const { fixture, component } = await initTest(TestComponent);

    let errorState = false;
    component.errorStateMatcher = {
      isErrorState: (_control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => {
        return errorState;
      },
    };

    fixture.detectChanges();

    // Empty
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-empty']);

    // Item selected
    ((component.select as any)._matSelect as MatSelect).options.last.select();
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select']);

    // Disabled
    component.control.disable();
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-disabled']);
    component.control.enable();

    // Invalid
    errorState = true;
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-invalid']);
    errorState = false;

    // Required
    component.select.required = true;
    fixture.detectChanges();
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-required']);
    component.select.required = false;

    // mat-option
    component.panelClass = { 'custom-mat-option-class': true };
    fixture.detectChanges();

    const matSelectTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
    matSelectTrigger.triggerEventHandler('click', new Event('click'));
    fixture.detectChanges();

    // select panel
    const selectPanelNode = document.querySelector('.mat-select-panel');
    expect(selectPanelNode).not.toBeNull();
    expect(selectPanelNode.classList).toContain('custom-mat-option-class');

    const matOptionNodes = selectPanelNode.querySelectorAll('mat-option');

    // mat-select-search
    expect(matOptionNodes.item(0).classList.contains('mat-option-disabled')).toBeTruthy();
    expect(matOptionNodes.item(0).classList.contains('ps-select-data__search')).toBeTruthy();

    // empty input
    expect(matOptionNodes.item(1).classList.contains('ps-select-data__empty-option')).toBeTruthy();

    // items
    expect(matOptionNodes.item(2).classList.contains('ps-select-data__option')).toBeTruthy();
  });

  it('should set multiple css class for multiple mode', async () => {
    const { fixture } = await initTest(TestMultipleComponent);

    const classes = getPsSelectCssClasses(fixture);
    expect(classes).toContain('ps-select-multiple');
  });

  it('should work with custom templates', async () => {
    const { fixture } = await initTest(TestCustomTemplateComponent);

    const matSelectTrigger = fixture.debugElement.query(By.css('.mat-select-trigger'));
    matSelectTrigger.triggerEventHandler('click', new Event('click'));
    fixture.detectChanges();

    // mat-option text
    const selectPanelNode = document.querySelector('.mat-select-panel');
    const matOptionNodes = selectPanelNode.querySelectorAll('mat-option');
    const itemNode = matOptionNodes.item(2);
    expect(itemNode.textContent.trim()).toEqual('color:blue:Blue');

    // select the mat-option
    itemNode.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    // trigger text
    expect(matSelectTrigger.nativeElement.textContent.trim()).toEqual('trigger:blue:color:blue:Blue'); // static trigger text + value + mat-option viewValue
  });
  it('should disable matOption for item with disable', async () => {
    const { fixture, component } = await initTest(TestMultipleComponent);
    component.dataSource = new DefaultPsSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      disabledKey: 'disabled',
      items: [
        { label: 'disabled', value: 1, disabled: true },
        { label: 'active', value: 2, disabled: false },
        { label: 'default', value: 3 },
      ],
    });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const options = ((component.select as any)._matSelect as MatSelect).options.toArray();
    expect(options.find((o) => o.value === 1).disabled).toBeTruthy();
    expect(options.find((o) => o.value === 2).disabled).toBeFalsy();
    expect(options.find((o) => o.value === 3).disabled).toBeFalsy();
  });
});

function getSelectedValueText(fixture: ComponentFixture<any>) {
  const testComponentElement: HTMLElement = fixture.nativeElement;
  const selectValueElement = testComponentElement.querySelector('.mat-select-value-text');
  return selectValueElement ? selectValueElement.children[0].textContent : null;
}

function getPsSelectCssClasses(fixture: ComponentFixture<any>) {
  const testComponentElement: HTMLElement = fixture.nativeElement;
  const classes = testComponentElement
    .querySelector('ps-select')
    .className.split(' ')
    .filter((x) => x.startsWith('ps-'))
    .sort();
  return classes;
}

function assertPsSelectCssClasses(fixture: ComponentFixture<any>, exprectedClasses: string[]) {
  const classes = getPsSelectCssClasses(fixture);
  expect(classes).toEqual(exprectedClasses.sort());
}

async function openMatSelect<T>(fixture: ComponentFixture<T>) {
  const sortSelectTriggerEl = fixture.debugElement.nativeElement.querySelectorAll('.mat-select-trigger').item(0) as HTMLElement;
  sortSelectTriggerEl.dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
  await fixture.whenRenderingDone();
}
// async function getMatOptionsNodes(): Promise<NodeListOf<HTMLElement>> {
//   const selectPanelNode = document.querySelector('.mat-select-panel');
//   const matOptionNodes = selectPanelNode.querySelectorAll('mat-option') as NodeListOf<HTMLElement>;
//   return matOptionNodes;
// }
async function getToggleAllInputCbx<T>(_fixture: ComponentFixture<T>): Promise<HTMLInputElement> {
  const selectPanelNode = document.querySelector('.mat-select-panel');
  const toggleAllElement = selectPanelNode.querySelector('.mat-select-search-toggle-all-checkbox input') as HTMLInputElement;
  return toggleAllElement;
}

async function closeMatSelect<T>(fixture: ComponentFixture<T>) {
  await closeBackdrop(fixture);
}
async function closeBackdrop<T>(fixture: ComponentFixture<T>) {
  document.querySelector('.cdk-overlay-backdrop').dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
  await fixture.whenRenderingDone();
}
