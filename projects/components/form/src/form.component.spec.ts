import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, DebugElement, Injectable, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { BaseZvFormService, IZvFormError, IZvFormErrorData, ZvFormService } from '@zvoove/components/form-base';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { IZvFormDataSource, IZvFormDataSourceConnectOptions } from './form-data-source';
import { ZvForm, dependencies } from './form.component';

@Injectable({ providedIn: 'root' })
class TestZvFormService extends BaseZvFormService {
  constructor() {
    super();
    this.options.debounceTime = null;
  }

  public getLabel(formControl: FormControl & { zvLabel: string }): Observable<string> | null {
    return formControl.zvLabel ? of(formControl.zvLabel) : null;
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
    <zv-form [dataSource]="dataSource">
      <div id="content">content text</div>
      <div id="hight-strech" style="height: 2000px;">hight strech</div>
      <ng-container zvFormSavebarButtons>
        <button mat-button type="button">btnCus</button>
      </ng-container>
    </zv-form>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ZvForm],
})
export class TestDataSourceComponent {
  public dataSource: IZvFormDataSource;
  @ViewChild(ZvForm) formComponent: ZvForm;
}

describe('ZvForm', () => {
  describe('integration with dataSource', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestDataSourceComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
    }));

    it('should render buttons correctly', async () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const loader = TestbedHarnessEnvironment.loader(fixture);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      let btn2Clicked = false;
      component.dataSource = createDataSource({
        buttons: [
          { type: 'stroked', label: 'btn1', color: 'primary', disabled: () => true, click: () => {} },
          {
            type: 'raised',
            label: 'btn2',
            dataCy: 'btn2',
            color: 'accent',
            disabled: () => false,
            click: () => {
              btn2Clicked = true;
            },
          },
        ],
      });
      fixture.detectChanges();

      const buttons = await loader.getAllHarnesses(MatButtonHarness);
      expect(buttons.length).toBe(3);

      {
        const customButton = await loader.getHarness(MatButtonHarness.with({ text: 'btnCus' }));
        expect(customButton).toBeTruthy();
      }

      {
        const btn1Button = await loader.getHarness(MatButtonHarness.with({ text: 'btn1' }));
        expect(btn1Button).toBeTruthy();
        expect(await btn1Button.getVariant()).toBe('basic');
        expect(await btn1Button.getAppearance()).toBe('outlined');
        expect(await btn1Button.isDisabled()).toBeTrue();
        const host = await btn1Button.host();
        expect(await host.hasClass('mat-primary')).toBeTrue();
        expect(await host.hasClass('zv-btn-primary')).toBeTrue();
      }

      {
        const btn2Button = await loader.getHarness(MatButtonHarness.with({ text: 'btn2' }));
        expect(btn2Button).toBeTruthy();
        expect(await btn2Button.getVariant()).toBe('basic');
        expect(await btn2Button.getAppearance()).toBe('elevated');
        expect(await btn2Button.isDisabled()).toBeFalse();
        const host = await btn2Button.host();
        expect(await host.hasClass('mat-accent')).toBeTrue();
        expect(await host.hasClass('zv-btn-accent')).toBeTrue();
        expect(await host.getAttribute('data-cy')).toEqual('btn2');
        await btn2Button.click();
        expect(btn2Clicked).toBeTruthy();
      }
    });

    it('should show progress', async () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      component.dataSource = createDataSource({ progress: null });
      fixture.detectChanges();

      expect(getProgress(fixture)).toBe(null);
      expect(isProgressBarVisible(fixture)).toBe(false);

      component.dataSource = createDataSource({ progress: 50 });
      fixture.detectChanges();

      expect(getProgress(fixture)).toBe('50%');
      expect(isProgressBarVisible(fixture)).toBe(true);
    });

    it('should show error view, when exception property is not null', async () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const dataSource = createDataSource();
      component.dataSource = dataSource;
      fixture.detectChanges();

      expect(getErrorContainer(fixture)).toBe(null);

      dataSource.exception = {
        errorObject: null,
      };
      dataSource.cdTrigger$.next();
      fixture.detectChanges();

      let errorContainer = getErrorContainer(fixture);
      expect(errorContainer).not.toBe(null);
      expect(errorContainer.classes['zv-form__error-container--center']).toBeFalsy();
      expect(getErrorIcon(fixture)).toBe(null);
      expect(getErrorText(fixture)).toBe('');

      dataSource.exception.errorObject = new Error('error1');
      dataSource.cdTrigger$.next();
      fixture.detectChanges();

      errorContainer = getErrorContainer(fixture);
      expect(errorContainer).not.toBe(null);
      expect(errorContainer.classes['zv-form__error-container--center']).toBeFalsy();
      expect(getErrorIcon(fixture)).toBe(null);
      expect(getErrorText(fixture)).toBe('error1');

      dataSource.exception.alignCenter = true;
      dataSource.cdTrigger$.next();
      fixture.detectChanges();
      errorContainer = getErrorContainer(fixture);
      expect(errorContainer.classes['zv-form__error-container--center']).toBe(true);

      dataSource.exception.icon = 'asdf-icon';
      dataSource.cdTrigger$.next();
      fixture.detectChanges();
      expect(getErrorIcon(fixture).nativeElement.textContent.trim()).toBe('asdf-icon');
      expect(getErrorText(fixture)).toBe('error1');
    });

    it('should block ui when contentBlocked is true', async () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const dataSource = createDataSource();
      component.dataSource = dataSource;
      fixture.detectChanges();

      const blockUi = getBlockUi(fixture);

      expect(blockUi.componentInstance.blocked()).toBe(false);

      dataSource.contentBlocked = true;
      dataSource.cdTrigger$.next();
      fixture.detectChanges();

      expect(blockUi.componentInstance.blocked()).toBe(true);
    });

    it('should hide content when contentVisible is false', async () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const dataSource = createDataSource();
      component.dataSource = dataSource;
      fixture.detectChanges();

      let contentNode = fixture.debugElement.query(By.css('#content'));
      expect(contentNode).toBeTruthy();

      dataSource.contentVisible = false;
      dataSource.cdTrigger$.next();
      fixture.detectChanges();

      contentNode = fixture.debugElement.query(By.css('#content'));
      expect(contentNode).toBeFalsy();
    });

    it("should call dataSource's connect() once per new dataSource", () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const ds1 = createDataSource();
      component.dataSource = ds1;
      spyOn(ds1, 'connect').and.callThrough();

      fixture.detectChanges();

      expect(ds1.connect).toHaveBeenCalledTimes(1);

      const ds2 = createDataSource();
      component.dataSource = ds2;
      spyOn(ds1, 'disconnect').and.callThrough();
      spyOn(ds2, 'connect').and.callThrough();

      fixture.detectChanges();

      expect(ds2.connect).toHaveBeenCalledTimes(1);
      expect(ds1.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle scrolling to error card and visibility updates correctly', async () => {
      let intersectCallback: (x: unknown) => void;
      let observedEl: Element;
      let observerOptions: IntersectionObserverInit;
      dependencies.intersectionObserver = function mockIO(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        intersectCallback = callback as unknown as (x: unknown) => void;
        observerOptions = options;

        return {
          observe: (el: Element) => {
            observedEl = el;
          },
          disconnect: () => {},
        } as unknown as IntersectionObserver;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const fixture = TestBed.createComponent(TestDataSourceComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      const ds = createDataSource();
      const errorInViewValues: boolean[] = [];
      let opts: IZvFormDataSourceConnectOptions;
      let errorInViewSub: Subscription;
      ds.connect = (options) => {
        opts = options;
        expect(errorInViewSub).not.toBeDefined();
        errorInViewSub = options.errorInView$.subscribe((value) => errorInViewValues.push(value));
        return ds.cdTrigger$;
      };
      ds.exception = { errorObject: new Error('asdf') };

      component.dataSource = ds;
      fixture.detectChanges();

      expect(opts).toBeDefined();
      expect(observerOptions).toEqual({
        root: null,
        rootMargin: '-100px',
        threshold: 0,
      });
      expect(getErrorContainer(fixture)).not.toBe(null);
      expect(observedEl).toBe(component.formComponent.errorCardWrapper.nativeElement);
      spyOn(component.formComponent.errorCardWrapper.nativeElement, 'scrollIntoView').and.callThrough();

      opts.scrollToError();
      expect(component.formComponent.errorCardWrapper.nativeElement.scrollIntoView).toHaveBeenCalledTimes(1);

      intersectCallback([{ intersectionRatio: 1 }]);
      intersectCallback([{ intersectionRatio: 1 }]);
      intersectCallback([{ intersectionRatio: 0 }]);

      expect(errorInViewValues).toEqual([false, true, false]);
      errorInViewSub.unsubscribe();
    });
  });
});

type ITestZvFormDataSource = {
  -readonly [K in keyof IZvFormDataSource]: IZvFormDataSource[K];
};
function createDataSource(override: Partial<IZvFormDataSource> = {}): ITestZvFormDataSource & { cdTrigger$: Subject<void> } {
  const cdTrigger$ = new Subject<void>();
  return {
    autocomplete: 'off',
    cdTrigger$: cdTrigger$,
    buttons: [],
    contentBlocked: false,
    contentVisible: true,
    exception: null,
    savebarMode: 'auto',
    form: new FormGroup({}),
    connect: () => cdTrigger$,
    disconnect: () => {},
    ...override,
  };
}

function getBlockUi<T>(fixture: ComponentFixture<T>): DebugElement {
  return fixture.debugElement.query(By.directive(ZvBlockUi));
}
function getErrorContainer<T>(fixture: ComponentFixture<T>): DebugElement {
  return fixture.debugElement.query(By.css('.zv-form__error-container'));
}
function getErrorIcon<T>(fixture: ComponentFixture<T>): DebugElement {
  return getErrorContainer(fixture).query(By.directive(MatIcon));
}
function getErrorText<T>(fixture: ComponentFixture<T>): string {
  let errorText: string = getErrorContainer(fixture).nativeElement.textContent.trim();
  const errorIconNode = getErrorIcon(fixture);
  if (errorIconNode) {
    const errorIconText = errorIconNode.nativeElement.textContent.trim();
    errorText = errorText.substring(errorIconText.length);
  }
  return errorText;
}
function getProgress<T>(fixture: ComponentFixture<T>): string {
  return fixture.debugElement.query(By.css('.zv-form__savebar-progress'))?.nativeElement.textContent.trim() ?? null;
}
function isProgressBarVisible<T>(fixture: ComponentFixture<T>): boolean {
  return !!fixture.debugElement.query(By.css('mat-progress-bar'));
}
