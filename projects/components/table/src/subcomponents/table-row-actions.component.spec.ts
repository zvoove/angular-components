import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';
import { IZvTableAction, ZvTableActionScope } from '../models';
import { ZvTableRowActionsComponent } from './table-row-actions.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-row-actions
      [actions]="actions"
      [loadActionsFn]="loadActionsFn"
      [openMenuFn]="openMenuFn"
      [item]="item"
      [moreMenuThreshold]="moreMenuThreshold"
    >
    </zv-table-row-actions>
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvTableRowActionsComponent],
})
export class TestComponent {
  public actions: IZvTableAction<any>[] = [];
  public loadActionsFn: (data: any, actions: IZvTableAction<any>[]) => Observable<IZvTableAction<any>[]> = null;
  public openMenuFn: (data: any, actions: IZvTableAction<any>[]) => Observable<IZvTableAction<any>[]> | IZvTableAction<any>[] | null = null;
  public item: any = {};
  public moreMenuThreshold = 2;

  @ViewChild(ZvTableRowActionsComponent, { static: true }) comp: ZvTableRowActionsComponent;

  public onSearchChanged(_event: string) {}
}

describe('ZvTableSearchComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, TestComponent],
    }).compileComponents();
  }));

  it('should respect threashold', async () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeDefined();

    component.actions = [{ icon: 'remove', label: 'Remove', scope: ZvTableActionScope.row, actionFn: () => {} }];
    const loader = TestbedHarnessEnvironment.loader(fixture);

    component.moreMenuThreshold = 2;
    fixture.detectChanges();

    await expectAsync(loader.getHarness(MatIconHarness.with({ name: 'more_vert' }))).toBeRejectedWithError();

    component.moreMenuThreshold = 0;
    fixture.detectChanges();

    const icon = await loader.getHarness(MatIconHarness.with({ name: 'more_vert' }));
    expect(icon).toBeDefined();
  });
});
