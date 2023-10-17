import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DebugElement, Injectable, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ZvBlockUiComponent } from '@zvoove/components/block-ui';
import { BaseZvFormService, IZvFormError, IZvFormErrorData, ZvFormService } from '@zvoove/components/form-base';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { IZvFormDataSource, IZvFormDataSourceConnectOptions } from './form-data-source';
import { ZvFormComponent, dependencies } from './form.component';
import { ZvFormModule } from './form.module';

@Injectable()
class TestZvFormService extends BaseZvFormService {
  constructor() {
    super();
    this.options.debounceTime = null;
  }

  public getLabel(formControl: any): Observable<string> | null {
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
        <button type="button">btnCus</button>
      </ng-container>
    </zv-form>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestDataSourceComponent {
  public dataSource: IZvFormDataSource;
  @ViewChild(ZvFormComponent) formComponent: ZvFormComponent;
}

describe('ZvFormComponent', () => {
  describe('integration with dataSource', () => {
    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, ZvFormModule],
        declarations: [TestDataSourceComponent],
        providers: [{ provide: ZvFormService, useClass: TestZvFormService }],
      }).compileComponents();
    }));

    it('should render buttons correctly', async () => {
      const fixture = TestBed.createComponent(TestDataSourceComponent);
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

      const buttons = getButtons(fixture);
      expect(buttons.length).toBe(3);

      {
        const customButton = buttons.find((x) => x.nativeElement.textContent === 'btnCus');
        expect(customButton).toBeTruthy();
      }

      {
        const btn1Button = buttons.find((x) => x.nativeElement.textContent.trim() === 'btn1');
        expect(btn1Button).toBeTruthy();
        const btn1Classes = getClasses(btn1Button);
        expect(btn1Classes).toContain('mat-mdc-outlined-button');
        expect(btn1Classes).toContain('mat-primary');
        expect(btn1Button.attributes.type).toEqual('button');
        expect(btn1Button.attributes.disabled).toEqual('true');
      }

      {
        const btn2Button = buttons.find((x) => x.nativeElement.textContent.trim() === 'btn2');
        expect(btn2Button).toBeTruthy();
        const btn2Classes = getClasses(btn2Button);
        expect(btn2Classes).toContain('mat-mdc-raised-button');
        expect(btn2Classes).toContain('mat-accent');
        expect(btn2Button.attributes.type).toEqual('button');
        expect(btn2Button.attributes.disabled).toBeFalsy();
        expect(btn2Button.attributes['data-cy']).toEqual('btn2');
        btn2Button.triggerEventHandler('click', null);
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

      expect(blockUi.componentInstance.blocked).toBe(false);

      dataSource.contentBlocked = true;
      dataSource.cdTrigger$.next();
      fixture.detectChanges();

      expect(blockUi.componentInstance.blocked).toBe(true);
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
      let intersectCallback: (x: any) => void;
      let observedEl: any;
      let observerOptions: any;
      dependencies.intersectionObserver = function mockIO(callback: any, options: any) {
        intersectCallback = callback;
        observerOptions = options;

        return {
          observe: (el: any) => {
            observedEl = el;
          },
          disconnect: () => {},
        };
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
        root: null as any,
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

function getButtons(fixture: ComponentFixture<TestDataSourceComponent>): DebugElement[] {
  return fixture.debugElement.query(By.css('.zv-form__buttons')).children;
}
function getClasses(node: DebugElement): string[] {
  return (node.nativeElement.className as string).split(' ');
}
function getBlockUi(fixture: ComponentFixture<any>): DebugElement {
  return fixture.debugElement.query(By.directive(ZvBlockUiComponent));
}
function getErrorContainer(fixture: ComponentFixture<any>): DebugElement {
  return fixture.debugElement.query(By.css('.zv-form__error-container'));
}
function getErrorIcon(fixture: ComponentFixture<any>): DebugElement {
  return getErrorContainer(fixture).query(By.directive(MatIcon));
}
function getErrorText(fixture: ComponentFixture<any>): string {
  let errorText: string = getErrorContainer(fixture).nativeElement.textContent.trim();
  const errorIconNode = getErrorIcon(fixture);
  if (errorIconNode) {
    const errorIconText = errorIconNode.nativeElement.textContent.trim();
    errorText = errorText.substring(errorIconText.length);
  }
  return errorText;
}
function getProgress(fixture: ComponentFixture<any>): string {
  return fixture.debugElement.query(By.css('.zv-form__savebar-progress'))?.nativeElement.textContent.trim() ?? null;
}
function isProgressBarVisible(fixture: ComponentFixture<any>): boolean {
  return !!fixture.debugElement.query(By.css('mat-progress-bar'));
}
