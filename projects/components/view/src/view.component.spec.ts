import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { ZvViewHarness } from './testing/view.harness';
import { IZvViewDataSource } from './view-data-source';
import { ZvViewComponent } from './view.component';
import { ZvViewModule } from './view.module';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-view [dataSource]="dataSource">
      <div id="content">content text</div>
      <div id="hight-strech" style="height: 2000px;">hight strech</div>
    </zv-view>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestDataSourceComponent {
  public dataSource: IZvViewDataSource;
  @ViewChild(ZvViewComponent) formComponent: ZvViewComponent;
}

describe('ZvViewComponent', () => {
  describe('integration with dataSource', () => {
    let fixture: ComponentFixture<TestDataSourceComponent>;
    let component: TestDataSourceComponent;
    let loader: HarnessLoader;
    let view: ZvViewHarness;
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, ZvViewModule],
        declarations: [TestDataSourceComponent],
      });
      fixture = TestBed.createComponent(TestDataSourceComponent);
      component = fixture.componentInstance;

      loader = TestbedHarnessEnvironment.loader(fixture);
      view = await loader.getHarness(ZvViewHarness);
    });

    it('should show error view, when exception property is not null', async () => {
      const dataSource = createDataSource();
      component.dataSource = dataSource;

      expect(await view.isErrorVisible()).toBe(false);

      dataSource.exception = {
        errorObject: null,
      };
      dataSource.cdTrigger$.next();

      expect(await view.isErrorVisible()).toBe(true);
      expect(await view.getErrorText()).toBe('');
      expect(await view.getErrorIconName()).toBe(null);
      expect(await view.isErrorCentered()).toBe(false);

      dataSource.exception.errorObject = new Error('error1');
      dataSource.cdTrigger$.next();

      expect(await view.isErrorVisible()).toBe(true);
      expect(await view.getErrorText()).toBe('error1');
      expect(await view.getErrorIconName()).toBe(null);
      expect(await view.isErrorCentered()).toBe(false);

      dataSource.exception.alignCenter = true;
      dataSource.cdTrigger$.next();
      expect(await view.isErrorCentered()).toBe(true);

      dataSource.exception.icon = 'asdf-icon';
      dataSource.cdTrigger$.next();
      expect(await view.getErrorIconName()).toBe('asdf-icon');
    });

    it('should block ui when contentBlocked is true', async () => {
      const dataSource = createDataSource();
      component.dataSource = dataSource;
      expect(await view.isContentBlocked()).toBe(false);

      dataSource.contentBlocked = true;
      dataSource.cdTrigger$.next();
      expect(await view.isContentBlocked()).toBe(true);
    });

    it('should hide content when contentVisible is false', async () => {
      const dataSource = createDataSource();
      component.dataSource = dataSource;
      expect(await view.isContentVisible()).toBe(true);

      dataSource.contentVisible = false;
      dataSource.cdTrigger$.next();
      expect(await view.isContentVisible()).toBe(false);
    });

    it("should call dataSource's connect() once per new dataSource", () => {
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
  });
});

type ITestZvViewDataSource = {
  -readonly [K in keyof IZvViewDataSource]: IZvViewDataSource[K];
};

const createDataSource = (override: Partial<IZvViewDataSource> = {}): ITestZvViewDataSource & { cdTrigger$: Subject<void> } => {
  const cdTrigger$ = new Subject<void>();
  return {
    cdTrigger$: cdTrigger$,
    contentBlocked: false,
    contentVisible: true,
    exception: null,
    connect: () => cdTrigger$,
    disconnect: () => {},
    ...override,
  };
};
