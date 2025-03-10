import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';
import { IZvTableAction, IZvTableActionRouterLink, ZvTableActionScope } from '../models';
import { ZvTableRowActionsComponent } from './table-row-actions.component';
import { RouterModule } from '@angular/router';
import { MatButtonHarness } from '@angular/material/button/testing';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-table-row-actions
      [actions]="actions"
      [loadActionsFn]="loadActionsFn"
      [openMenuFn]="openMenuFn"
      [item]="item"
      [moreMenuThreshold]="moreMenuThreshold"
    />
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ZvTableRowActionsComponent],
})
export class TestComponent {
  public actions: IZvTableAction<any>[] = [];
  public loadActionsFn: (data: any, actions: IZvTableAction<any>[]) => Observable<IZvTableAction<any>[]> = null;
  public openMenuFn: (data: any, actions: IZvTableAction<any>[]) => Observable<IZvTableAction<any>[]> | IZvTableAction<any>[] | null = null;
  public item: any = {};
  public moreMenuThreshold = 2;

  @ViewChild(ZvTableRowActionsComponent, { static: true }) comp: ZvTableRowActionsComponent<any>;
}

describe('ZvTableRowActionsComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, RouterModule.forRoot([]), TestComponent],
    }).compileComponents();
  }));

  it('should respect threshold', async () => {
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

  const disabledFnTestCases: {
    isDisabledFn?: () => boolean;
    actionFn?: () => void;
    routerLink?: () => IZvTableActionRouterLink;
    children?: IZvTableAction<unknown>[];
    expected: boolean;
  }[] = [
    { actionFn: () => {}, isDisabledFn: () => true, expected: true },
    { actionFn: () => {}, isDisabledFn: () => false, expected: false },
    { actionFn: () => {}, isDisabledFn: undefined, expected: false },
    { routerLink: () => ({ path: ['/'] }), isDisabledFn: () => true, expected: true },
    { routerLink: () => ({ path: ['/'] }), isDisabledFn: () => false, expected: false },
    { routerLink: () => ({ path: ['/'] }), isDisabledFn: undefined, expected: false },
    { children: [{} as IZvTableAction<unknown>], isDisabledFn: () => true, expected: true },
    { children: [{} as IZvTableAction<unknown>], isDisabledFn: () => false, expected: false },
    { children: [{} as IZvTableAction<unknown>], isDisabledFn: undefined, expected: false },
  ];

  disabledFnTestCases.forEach((testCase) => {
    it('should respect disabledFn', async () => {
      const fixture = TestBed.createComponent(TestComponent);
      const component = fixture.componentInstance;
      expect(component).toBeDefined();

      component.actions = [
        {
          icon: 'remove',
          label: 'Remove',
          scope: ZvTableActionScope.row,
          actionFn: testCase.actionFn,
          isDisabledFn: testCase.isDisabledFn,
          routerLink: testCase.routerLink,
        },
      ];
      const loader = TestbedHarnessEnvironment.loader(fixture);
      fixture.detectChanges();

      const button = await loader.getHarness(MatButtonHarness);
      expect(button).toBeDefined();
      expect(await button.isDisabled()).toBe(testCase.expected);
      if (testCase.routerLink && testCase.expected) {
        expect(await (await button.host()).getCssValue('pointer-events')).toBe('none');
      }
    });
  });
});
