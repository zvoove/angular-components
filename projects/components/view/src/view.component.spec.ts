import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { PsViewHarness } from './testing/view.harness';
import { IPsViewDataSource } from './view-data-source';
import { PsViewComponent } from './view.component';
import { PsViewModule } from './view.module';

@Component({
  selector: 'ps-test-component',
  template: `
    <ps-view [dataSource]="dataSource">
      <div id="content">content text</div>
      <div id="hight-strech" style="height: 2000px;">hight strech</div>
    </ps-view>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TestDataSourceComponent {
  public dataSource: IPsViewDataSource;
  @ViewChild(PsViewComponent) formComponent: PsViewComponent;
}

describe('PsViewComponent', () => {
  describe('integration with dataSource', () => {
    let fixture: ComponentFixture<TestDataSourceComponent>;
    let component: TestDataSourceComponent;
    let loader: HarnessLoader;
    let view: PsViewHarness;
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NoopAnimationsModule, CommonModule, PsViewModule],
        declarations: [TestDataSourceComponent],
      });
      fixture = TestBed.createComponent(TestDataSourceComponent);
      component = fixture.componentInstance;
      expect(component).toBeDefined();

      loader = TestbedHarnessEnvironment.loader(fixture);
      view = await loader.getHarness(PsViewHarness);
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

type ITestPsViewDataSource = {
  -readonly [K in keyof IPsViewDataSource]: IPsViewDataSource[K];
};

const createDataSource = (override: Partial<IPsViewDataSource> = {}): ITestPsViewDataSource & { cdTrigger$: Subject<void> } => {
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
