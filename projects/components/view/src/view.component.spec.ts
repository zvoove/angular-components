import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IZvException } from '@zvoove/components/core';
import { ZvViewHarness } from './testing/view.harness';
import { IZvViewDataSource } from './view-data-source';
import { ZvView } from './view.component';

class TestViewDataSource implements IZvViewDataSource {
  contentBlocked = signal(false);
  contentVisible = signal(true);
  exception = signal<IZvException | null>(null);
  connect = () => {};
  disconnect = () => {};
}

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
  imports: [CommonModule, ZvView],
})
export class TestDataSourceComponent {
  public dataSource: TestViewDataSource;
  @ViewChild(ZvView) formComponent: ZvView;
}

describe('ZvView', () => {
  describe('integration with dataSource', () => {
    let fixture: ComponentFixture<TestDataSourceComponent>;
    let component: TestDataSourceComponent;
    let loader: HarnessLoader;
    let view: ZvViewHarness;
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestDataSourceComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(TestDataSourceComponent);
      component = fixture.componentInstance;

      loader = TestbedHarnessEnvironment.loader(fixture);
      view = await loader.getHarness(ZvViewHarness);
    });

    it('should show error view, when exception property is not null', async () => {
      const dataSource = new TestViewDataSource();
      component.dataSource = dataSource;

      expect(await view.isErrorVisible()).toBe(false);

      dataSource.exception.set({
        errorObject: null,
      });

      expect(await view.isErrorVisible()).toBe(true);
      expect(await view.getErrorText()).toBe('');
      expect(await view.getErrorIconName()).toBe(null);
      expect(await view.isErrorCentered()).toBe(false);

      dataSource.exception.update((val) => ({ ...val, errorObject: new Error('error1') }));

      expect(await view.isErrorVisible()).toBe(true);
      expect(await view.getErrorText()).toBe('error1');
      expect(await view.getErrorIconName()).toBe(null);
      expect(await view.isErrorCentered()).toBe(false);

      dataSource.exception.update((val) => ({ ...val, alignCenter: true }) as IZvException);
      expect(await view.isErrorCentered()).toBe(true);

      dataSource.exception.update((val) => ({ ...val, icon: 'asdf-icon' }) as IZvException);
      expect(await view.getErrorIconName()).toBe('asdf-icon');
    });

    it('should block ui when contentBlocked is true', async () => {
      const dataSource = new TestViewDataSource();
      component.dataSource = dataSource;
      expect(await view.isContentBlocked()).toBe(false);

      dataSource.contentBlocked.set(true);
      expect(await view.isContentBlocked()).toBe(true);
    });

    it('should hide content when contentVisible is false', async () => {
      const dataSource = new TestViewDataSource();
      component.dataSource = dataSource;
      expect(await view.isContentVisible()).toBe(true);

      dataSource.contentVisible.set(false);
      expect(await view.isContentVisible()).toBe(false);
    });

    it("should call dataSource's connect() once per new dataSource", () => {
      const ds1 = new TestViewDataSource();
      component.dataSource = ds1;
      spyOn(ds1, 'connect').and.callThrough();

      fixture.detectChanges();

      expect(ds1.connect).toHaveBeenCalledTimes(1);

      const ds2 = new TestViewDataSource();
      component.dataSource = ds2;
      spyOn(ds1, 'disconnect').and.callThrough();
      spyOn(ds2, 'connect').and.callThrough();

      fixture.detectChanges();

      expect(ds2.connect).toHaveBeenCalledTimes(1);
      expect(ds1.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
