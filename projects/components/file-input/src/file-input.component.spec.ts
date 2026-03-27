import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarnessLoader } from '@angular/cdk/testing';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ZvFileInput } from './file-input.component';
import { ZvFileInputHarness } from './testing/file-input.harness';

@Component({
  selector: 'zv-test-component',
  template: ` <zv-file-input [accept]="accept()" /> `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ZvFileInput],
})
export class TestComponent {
  readonly fileInputCmp = viewChild(ZvFileInput);

  readonly accept = signal<string[]>([]);
}

describe('ZvFileInput', () => {
  let cmp: ZvFileInput;
  let fixture: ComponentFixture<TestComponent>;
  let loader: HarnessLoader;
  let harness: ZvFileInputHarness;
  let detectChanges: () => void;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    cmp = fixture.componentInstance.fileInputCmp();

    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(ZvFileInputHarness);

    detectChanges = () => {
      cmp._cd.markForCheck();
      fixture.detectChanges();
    };
  });

  it('should be defined', () => {
    expect(cmp).toBeDefined();
  });

  it('Should respect disabled', async () => {
    cmp.disabled = true;
    detectChanges();

    expect(await harness.isDisabled()).toEqual(true);
  });

  it('should respect accept placeholder, required and readonly', async () => {
    expect(await harness.getAccept()).toEqual('');
    expect(await harness.getPlaceholder()).toEqual('');
    expect(await harness.isRequired()).toEqual(false);
    expect(await harness.isReadonly()).toEqual(false);

    fixture.componentInstance.accept.set(['.png', '.jpg']);
    cmp.placeholder = 'PLACEHOLDER';
    cmp.required = true;
    cmp.readonly = true;
    detectChanges();

    expect(await harness.getAccept()).toEqual('.png,.jpg');
    expect(await harness.getPlaceholder()).toEqual('PLACEHOLDER');
    expect(await harness.isRequired()).toEqual(true);
    expect(await harness.isReadonly()).toEqual(true);
  });

  it('should set filename and empty correctly when setting the file in various ways', async () => {
    cmp.value = null;
    detectChanges();

    expect(cmp.empty).toBe(true);
    expect(await harness.getText()).toEqual(cmp.fileSelectText);

    cmp.value = new File([], 'test.png');
    detectChanges();

    expect(cmp.empty).toBe(false);
    expect(await harness.getText()).toEqual('test.png');

    await harness.clickRemove();

    expect(cmp.empty).toBe(true);
    expect(await harness.getText()).toEqual(cmp.fileSelectText);

    cmp.writeValue(new File([], 'test2.png'));
    detectChanges();

    expect(cmp.empty).toBe(false);
    expect(await harness.getText()).toEqual('test2.png');

    cmp.onFileSelected({ target: { files: [new File([], 'test3.png')] } as unknown as HTMLInputElement } as unknown as Event);
    detectChanges();

    expect(cmp.empty).toBe(false);
    expect(await harness.getText()).toEqual('test3.png');
  });
});
