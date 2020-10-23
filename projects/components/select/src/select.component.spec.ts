import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectorRef, Component, Injectable, OnDestroy, QueryList, Type, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatOptionHarness, OptionHarnessFilters } from '@angular/material/core/testing';
import { MatSelect } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, ReplaySubject, Subject, Subscription, throwError } from 'rxjs';
import { DefaultPsSelectDataSource } from './defaults/default-select-data-source';
import { DefaultPsSelectService, PsSelectData } from './defaults/default-select-service';
import { PsSelectItem } from './models';
import { PsSelectDataSource } from './select-data-source';
import { PsSelectComponent } from './select.component';
import { PsSelectModule } from './select.module';
import { PsSelectService } from './select.service';
import { PsSelectHarness } from './testing/select.harness';

function createFakeMatSelect(): MatSelect {
  const matSelect = <any>{
    value: null,
    stateChanges: new Subject<void>(),
    openedChange: new Subject<void>(),
    close: () => {},
    _onChange: () => {},
    _onTouched: null,
    ngControl: new FormControl(),
    options: new QueryList(),
    writeValue: () => {},
    setDisabledState: () => {},
  };

  matSelect.writeValue = (val: any) => {
    matSelect.value = val;
  };
  matSelect.registerOnChange = (val: any) => {
    matSelect._onChange = val;
  };
  matSelect.registerOnTouched = (val: any) => {
    matSelect._onTouched = val;
  };

  return matSelect;
}

function createFakeSelectService(): PsSelectService {
  const service = <PsSelectService>{
    createDataSource: (ds: any) => ds,
  };

  return service;
}

function createFakeDataSource(items: PsSelectItem[] = []): PsSelectDataSource {
  const dataSource = <PsSelectDataSource>{
    connect: () => of<PsSelectItem[]>(items),
    disconnect: () => {},
    selectedValuesChanged: (_: any | any[]) => {},
    panelOpenChanged: (_: boolean) => {},
    searchTextChanged: (_: string) => {},
  };

  return dataSource;
}

function createPsSelect(options?: { dataSource?: PsSelectDataSource; service: PsSelectService }) {
  const matSelect = createFakeMatSelect();
  const dataSource = options?.dataSource ?? createFakeDataSource();
  const service = options?.service ?? createFakeSelectService();
  const component = new PsSelectComponent({ nativeElement: {} }, null, service, <any>{ markForCheck: () => {} }, null, null, <any>{
    control: null,
  });
  component.setMatSelect = matSelect;
  component.dataSource = dataSource;
  return { component: component, matSelect: matSelect, service: service, dataSource: dataSource };
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
  dataSource: any = [ITEMS.RED, ITEMS.GREEN, ITEMS.BLUE];
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

const ITEMS = {
  RED: { value: 'red', label: 'Red' },
  GREEN: { value: 'green', label: 'Green' },
  BLUE: { value: 'blue', label: 'Blue' },
};

@Component({
  selector: 'ps-test-multiple-component',
  template: ` <ps-select [(ngModel)]="value" [dataSource]="dataSource" [multiple]="true" [showToggleAll]="showToggleAll"></ps-select> `,
})
export class TestMultipleComponent {
  showToggleAll = true;
  dataSource: any = [ITEMS.RED, ITEMS.GREEN, ITEMS.BLUE];
  value: any = null;

  @ViewChild(PsSelectComponent, { static: true }) select: PsSelectComponent;

  constructor(public cd: ChangeDetectorRef) {}
}

@Component({
  selector: 'ps-test-value',
  template: `<ps-select [(value)]="value" [dataSource]="items"></ps-select>`,
})
export class TestValueComponent {
  public items = [ITEMS.RED, ITEMS.GREEN, ITEMS.BLUE];
  public value: any = null;
}

@Component({
  selector: 'ps-test-custom-template',
  template: `
    <ps-select [(value)]="value" [dataSource]="items">
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
  public items = [ITEMS.RED, ITEMS.GREEN, ITEMS.BLUE];
  public value: any = null;
}

@Injectable()
export class TestPsSelectService extends DefaultPsSelectService {
  static calledwith: { dataSource: any; control: AbstractControl }[] = [];
  public createDataSource<T>(dataSource: PsSelectData<T>, control: AbstractControl | null): PsSelectDataSource<T> {
    TestPsSelectService.calledwith.push({ dataSource: dataSource, control: control });
    return super.createDataSource(dataSource, control);
  }
}

async function initTest<T>(
  type: Type<T>
): Promise<{ fixture: ComponentFixture<T>; component: T; loader: HarnessLoader; psSelect: PsSelectHarness }> {
  TestPsSelectService.calledwith = [];
  await TestBed.configureTestingModule({
    imports: [NoopAnimationsModule, PsSelectModule.forRoot(TestPsSelectService), FormsModule, ReactiveFormsModule],
    declarations: [TestComponent, TestMultipleComponent, TestCustomTemplateComponent, TestValueComponent],
  });
  const fixture = TestBed.createComponent(type);
  const component = fixture.componentInstance;
  expect(component).toBeDefined();

  const loader = TestbedHarnessEnvironment.loader(fixture);
  return {
    fixture: fixture,
    component: component,
    loader: loader,
    psSelect: await loader.getHarness(PsSelectHarness),
  };
}

describe('PsSelectComponent', () => {
  it('should use right default values', () => {
    const { component } = createPsSelect();

    expect(component.clearable).toBe(true);
    expect(component.showToggleAll).toBe(true);
    expect(component.multiple).toBe(false);
    expect(component.errorStateMatcher).toBe(null);
    expect(component.panelClass).toBe(null);
    expect(component.placeholder).toBe(null);
    expect(component.required).toBe(false);
    expect(component.disabled).toBe(false);
  });

  // Probably unneccessary now
  xit('should fix MatSelect.close() not emitting stateChanges', fakeAsync(() => {
    const matSelect = createFakeMatSelect();

    const { component } = createPsSelect();
    component.setMatSelect = matSelect;

    spyOn(matSelect.stateChanges, 'next');

    matSelect.close();

    expect(matSelect.stateChanges.next).toHaveBeenCalled();
  }));

  it('should update disabled property when calling setDisabledState', () => {
    const { component } = createPsSelect();
    component.disabled = true;

    component.setDisabledState(false);
    expect(component.disabled).toBe(false);

    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it("should not switch dataSource when dataSource input doesn't change", async () => {
    const { component, service } = createPsSelect();
    const items = [{ value: 1, label: 'i1', hidden: false }];
    const ds = createFakeDataSource(items);
    spyOn(service, 'createDataSource').and.returnValue(ds);

    component.dataSource = 'a';
    component.ngOnInit();
    expect(service.createDataSource).toHaveBeenCalledTimes(1);

    component.dataSource = 'lookup';
    expect(service.createDataSource).toHaveBeenCalledTimes(2);

    component.dataSource = 'lookup';
    expect(service.createDataSource).toHaveBeenCalledTimes(2);

    expect(component.items).toEqual(items);
    expect(component.dataSource).toBe(ds);
  });

  it('should work with ngModel', async () => {
    const { component, psSelect } = await initTest(TestMultipleComponent);
    await psSelect.clickOptions({ text: ITEMS.GREEN.label });
    expect(component.value).toEqual([ITEMS.GREEN.value]);
  });

  it('should work with value binding', async () => {
    const { component, psSelect } = await initTest(TestValueComponent);
    await psSelect.clickOptions({ text: ITEMS.RED.label });
    expect(component.value).toEqual(ITEMS.RED.value);
  });

  it('should emit only once when selecting an option', async () => {
    const { component, psSelect } = await initTest(TestComponent);
    await psSelect.clickOptions({ text: ITEMS.GREEN.label });
    await psSelect.clickOptions({ text: '--' });
    expect(component.emittedValues).toEqual([ITEMS.GREEN.value, undefined]);
  });

  it('should use the error state matcher input', async () => {
    const { component, psSelect } = await initTest(TestComponent);

    // Default matcher
    component.control.patchValue(null);
    expect(await psSelect.isErrorState()).toBe(false);

    // Custom matcher - empty value
    component.errorStateMatcher = {
      isErrorState: (control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => {
        return !!(control && control.invalid);
      },
    };
    expect(await psSelect.isErrorState()).toBe(true);

    // Custom matcher - item 1
    component.control.patchValue(1);
    expect(await psSelect.isErrorState()).toBe(false);
  });

  it('should use clearable input', async () => {
    const { component, psSelect } = await initTest(TestComponent);
    component.clearable = true;
    await psSelect.open();
    expect(await psSelect.getEmptyOption()).toBeTruthy();
    component.clearable = false;
    expect(await psSelect.getEmptyOption()).toBeFalsy();
  });

  it('toggle all functionality should work', async () => {
    const { component, psSelect } = await initTest(TestMultipleComponent);
    component.showToggleAll = true;
    await psSelect.open();
    const selectSearch = await psSelect.getPanelHeader();
    const toggle = await selectSearch.getToggleAll();
    expect(await getOptionIsSelected(psSelect)).toEqual([false, false, false]);

    await toggle.check();
    expect(await getOptionIsSelected(psSelect)).toEqual([true, true, true]);

    await toggle.uncheck();
    expect(await getOptionIsSelected(psSelect)).toEqual([false, false, false]);

    const options = await psSelect.getOptions();
    await last(options).click();
    expect(await getOptionIsSelected(psSelect)).toEqual([false, false, true]);
    expect(await toggle.isIndeterminate()).toBe(true);

    await toggle.check();
    expect(await getOptionIsSelected(psSelect)).toEqual([true, true, true]);

    component.showToggleAll = false;
    expect(await selectSearch.getToggleAll()).toBeFalsy();
  });

  it('should set the right css classes', async () => {
    const { fixture, component, psSelect } = await initTest(TestComponent);

    let errorState = false;
    component.errorStateMatcher = {
      isErrorState: (_control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean => {
        return errorState;
      },
    };

    await psSelect.open();

    // Empty
    assertPsSelectCssClasses(fixture, ['ps-select', 'ps-select-empty']);

    // Item selected
    const options = await psSelect.getOptions();
    await last(options).click();
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
    expect(matOptionNodes.item(0).classList.contains('ps-select__search')).toBeTruthy();

    // empty input
    expect(matOptionNodes.item(1).classList.contains('ps-select__empty-option')).toBeTruthy();

    // items
    expect(matOptionNodes.item(2).classList.contains('ps-select__option')).toBeTruthy();
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
    const { component, psSelect } = await initTest(TestMultipleComponent);
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

    await psSelect.open();
    expect(await (await psSelect.getOptions({ text: 'disabled' }))[0].isDisabled()).toBeTruthy();
    expect(await (await psSelect.getOptions({ text: 'active' }))[0].isDisabled()).toBeFalsy();
    expect(await (await psSelect.getOptions({ text: 'default' }))[0].isDisabled()).toBeFalsy();
  });

  it('should take DataSource compareWith function', async () => {
    const { component, psSelect } = await initTest(TestComponent);
    component.dataSource = new DefaultPsSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ],
    });
    let calledCount = 0;
    component.dataSource.compareWith = (a: any, b: any) => {
      ++calledCount;
      return a === 1 && b === 2;
    };
    component.control.patchValue(2);
    await psSelect.open();

    const optionTexts = await getOptionData(psSelect, (o) => o.getText(), { isSelected: true });
    expect(optionTexts).toEqual(['1']);
    expect(calledCount).toBeGreaterThan(0);
  });

  it('should switch to new dataSource when new dataSource is set', async () => {
    const { fixture, component, psSelect } = await initTest(TestComponent);
    TestPsSelectService.calledwith = [];

    component.dataSource = new DefaultPsSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
      ],
    });
    component.control.patchValue(2);

    fixture.detectChanges();
    expect(TestPsSelectService.calledwith.length).toBe(1);
    expect(TestPsSelectService.calledwith[0].dataSource).toBe(component.dataSource);
    expect(TestPsSelectService.calledwith[0].control).toBe(component.control);

    await psSelect.open();
    const selectSearch = await psSelect.getPanelHeader();
    const filter = await selectSearch.getFilter();

    {
      await filter.setValue('2');

      const optionTexts = await getOptionData(psSelect, (o) => o.getText(), { isSelected: true });
      expect(optionTexts).toEqual(['2']);
    }

    {
      component.dataSource = new DefaultPsSelectDataSource({
        mode: 'id',
        labelKey: 'label',
        idKey: 'value',
        items: [
          { label: '3', value: 3 },
          { label: '1', value: 1 },
          // selected label missing
        ],
      });
      fixture.detectChanges();
      expect(TestPsSelectService.calledwith.length).toBe(2);
      expect(TestPsSelectService.calledwith[1].dataSource).toBe(component.dataSource);
      expect(TestPsSelectService.calledwith[1].control).toBe(component.control);

      const selectedOptionTexts = await getOptionData(psSelect, (o) => o.getText(), { isSelected: true });
      expect(selectedOptionTexts.length).toBe(1);
      expect(selectedOptionTexts[0]).toContain('???'); // missing options got created

      const options1 = await psSelect.getOptions({ text: '1' });
      expect(await (await options1[0].host()).hasClass('ps-select__option--hidden')).toBe(true); // filter got applied

      const optionTexts = await getOptionData(psSelect, (o) => o.getText());
      // sorting is correct
      expect(optionTexts[0]).toContain('2');
      expect(optionTexts[1]).toBe('1');
      expect(optionTexts[2]).toBe('3');
    }
  });

  it('should show load errors as disabled option, but still show selected option', async () => {
    const { fixture, component, psSelect } = await initTest(TestComponent);
    component.dataSource = new DefaultPsSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: () => throwError('my error'),
    });
    component.control.patchValue(2);

    fixture.detectChanges();

    await psSelect.open();

    let options = await psSelect.getOptions();
    expect(options.length).toBe(3);

    expect(await options[0].getText()).toBe('my error');
    expect(await options[0].isDisabled()).toBe(true);

    expect(await options[1].getText()).toBe('--');
    expect(await options[1].isDisabled()).toBe(false);

    expect(await options[2].getText()).toContain('2');
    expect(await options[2].isDisabled()).toBe(false);
    expect(await options[2].isSelected()).toBe(true);

    await options[1].click();
    await psSelect.open();

    options = await psSelect.getOptions();
    expect(options.length).toBe(1);

    expect(await options[0].getText()).toBe('my error');
    expect(await options[0].isDisabled()).toBe(true);
  });

  it('should show loading spinner while loading and open', async () => {
    const { component, psSelect } = await initTest(TestComponent);
    const items$ = new ReplaySubject(1);
    component.dataSource = new DefaultPsSelectDataSource({
      mode: 'id',
      labelKey: 'label',
      idKey: 'value',
      items: () => items$ as Observable<any>,
    });

    await psSelect.open();
    const header = await psSelect.getPanelHeader();
    expect(await header.isLoading()).toBe(true);

    items$.next([]);
    await delay(); // the datasource debounces the items...

    expect(await header.isLoading()).toBe(false);

    items$.complete();
  });
});

async function getOptionIsSelected(psSelect: PsSelectHarness) {
  return getOptionData(psSelect, (o) => o.isSelected());
}

async function getOptionData<T>(
  psSelect: PsSelectHarness,
  transform: (option: MatOptionHarness) => Promise<T>,
  filter?: Omit<OptionHarnessFilters, 'ancestor'>
) {
  const options = await psSelect.getOptions(filter);
  return Promise.all(options.map((o) => transform(o)));
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

function last<T>(a: T[]): T {
  return a[a.length - 1];
}

function delay(duration = 0) {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}
