import { CommonModule } from '@angular/common';
import { Component, DebugElement, Injectable, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PsBlockUiComponent } from '@prosoft/components/block-ui';
import { PsIntlService, PsIntlServiceEn } from '@prosoft/components/core';
import { BasePsFormService, IPsFormError, IPsFormErrorData, PsFormService } from '@prosoft/components/form-base';
import { Observable, of, Subject, Subscription } from 'rxjs';

import { IPsFormDataSource, IPsFormDataSourceConnectOptions } from './form-data-source';
import { dependencies, PsFormComponent } from './form.component';
import { PsFormModule } from './form.module';

@Injectable()
class TestPsFormService extends BasePsFormService {
  constructor() {
    super();
    this.options.debounceTime = null;
  }

  public getLabel(formControl: any): Observable<string> | null {
    return formControl.psLabel ? of(formControl.psLabel) : null;
  }
  protected mapDataToError(errorData: IPsFormErrorData[]): Observable<IPsFormError[]> {
    return of(
      errorData.map((data) => ({
        errorText: data.errorKey,
        data: data,
      }))
    );
  }
}

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-form [dataSource]="dataSource">
      <div id="content">content text</div>
      <div id="hight-strech" style="height: 2000px;">hight strech</div>
      <ng-container psFormSavebarButtons>
        <button type="button">btnCus</button>
      </ng-container>
    </ps-form>
  `,
})
export class TestDataSourceComponent {
  public dataSource: IPsFormDataSource;
  @ViewChild(PsFormComponent) formComponent: PsFormComponent;
}

describe('PsFormComponent', () => {
  describe('integration with dataSource', () => {
    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [NoopAnimationsModule, CommonModule, PsFormModule],
          declarations: [TestDataSourceComponent],
          providers: [
            { provide: PsFormService, useClass: TestPsFormService },
            { provide: PsIntlService, useClass: PsIntlServiceEn },
          ],
        }).compileComponents();
      })
    );

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
        expect(btn1Classes).toContain('mat-stroked-button');
        expect(btn1Classes).toContain('mat-primary');
        expect(btn1Button.attributes.type).toEqual('button');
        expect(btn1Button.attributes.disabled).toEqual('true');
      }

      {
        const btn2Button = buttons.find((x) => x.nativeElement.textContent.trim() === 'btn2');
        expect(btn2Button).toBeTruthy();
        const btn2Classes = getClasses(btn2Button);
        expect(btn2Classes).toContain('mat-raised-button');
        expect(btn2Classes).toContain('mat-accent');
        expect(btn2Button.attributes.type).toEqual('button');
        expect(btn2Button.attributes.disabled).toBeFalsy();
        btn2Button.triggerEventHandler('click', null);
        expect(btn2Clicked).toBeTruthy();
      }
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
      expect(errorContainer.classes['ps-form__error-container--center']).toBeFalsy();
      expect(getErrorIcon(fixture)).toBe(null);
      expect(getErrorText(fixture)).toBe('');

      dataSource.exception.errorObject = new Error('error1');
      dataSource.cdTrigger$.next();
      fixture.detectChanges();

      errorContainer = getErrorContainer(fixture);
      expect(errorContainer).not.toBe(null);
      expect(errorContainer.classes['ps-form__error-container--center']).toBeFalsy();
      expect(getErrorIcon(fixture)).toBe(null);
      expect(getErrorText(fixture)).toBe('error1');

      dataSource.exception.alignCenter = true;
      dataSource.cdTrigger$.next();
      fixture.detectChanges();
      errorContainer = getErrorContainer(fixture);
      expect(errorContainer.classes['ps-form__error-container--center']).toBe(true);

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
      dependencies.IntersectionObserver = function MockIO(callback: any, options: any) {
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
      let opts: IPsFormDataSourceConnectOptions;
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

type ITestPsFormDataSource = {
  -readonly [K in keyof IPsFormDataSource]: IPsFormDataSource[K];
};
function createDataSource(override: Partial<IPsFormDataSource> = {}): ITestPsFormDataSource & { cdTrigger$: Subject<void> } {
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
  return fixture.debugElement.query(By.css('.ps-form__buttons')).children;
}
function getClasses(node: DebugElement): string[] {
  return (node.nativeElement.className as string).split(' ');
}
function getBlockUi(fixture: ComponentFixture<any>): DebugElement {
  return fixture.debugElement.query(By.directive(PsBlockUiComponent));
}
function getErrorContainer(fixture: ComponentFixture<any>): DebugElement {
  return fixture.debugElement.query(By.css('.ps-form__error-container'));
}
function getErrorIcon(fixture: ComponentFixture<any>): DebugElement {
  return getErrorContainer(fixture).query(By.directive(MatIcon));
}
function getErrorText(fixture: ComponentFixture<any>): string {
  let errorText: string = getErrorContainer(fixture).nativeElement.textContent.trim();
  const errorIconNode = getErrorIcon(fixture);
  if (errorIconNode) {
    const errorIconText = errorIconNode.nativeElement.textContent.trim();
    errorText = errorText.substr(errorIconText.length);
  }
  return errorText;
}
