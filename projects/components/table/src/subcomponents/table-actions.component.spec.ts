import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconButton } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { RouterModule } from '@angular/router';
import { IZvTableAction, IZvTableActionRouterLink, ZvTableActionScope } from '../models';
import { ZvTableActionsComponent } from './table-actions.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <button mat-icon-button type="button" [matMenuTriggerFor]="comp.menu()">
      <mat-icon>more_vert</mat-icon>
    </button>
    <zv-table-actions [actions]="actions" [items]="items" />
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ZvTableActionsComponent, MatIcon, MatIconButton, MatMenuTrigger],
})
export class TestComponent {
  public actions: IZvTableAction<any>[] = [];
  public items: any = [];

  @ViewChild(ZvTableActionsComponent, { static: true }) comp: ZvTableActionsComponent<any>;
}

describe('ZvTableActionsComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), TestComponent],
    }).compileComponents();
  }));

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

      const menuTrigger = await loader.getHarness(MatButtonHarness);
      menuTrigger.click();

      const menu = await loader.getHarness(MatMenuHarness);
      expect(menu).toBeDefined();
      const items = await menu.getItems();
      expect(items[0]).toBeDefined();
      expect(await items[0].isDisabled()).toBe(testCase.expected);
      if (testCase.routerLink && testCase.expected) {
        expect(await (await items[0].host()).getCssValue('pointer-events')).toBe('none');
      }
    });
  });
});
