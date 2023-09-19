/* eslint-disable no-underscore-dangle */
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HarnessLoader } from '@angular/cdk/testing';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { ZvFileInputComponent } from './file-input.component';
import { ZvFileInputHarness } from './testing/file-input.harness';

@Component({
  selector: 'zv-test-component',
  template: ` <zv-file-input /> `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [ZvFileInputComponent],
})
export class TestComponent {
  @ViewChild(ZvFileInputComponent) fileInputCmp!: ZvFileInputComponent;
}

describe('ZvFileInputComponent', () => {
  let cmp: ZvFileInputComponent;
  let fixture: ComponentFixture<TestComponent>;
  let loader: HarnessLoader;
  let harness: ZvFileInputHarness;
  let detectChanges: () => void;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    cmp = fixture.componentInstance.fileInputCmp;
    // eslint-disable-next-line jasmine/no-expect-in-setup-teardown
    expect(cmp).toBeDefined();

    loader = TestbedHarnessEnvironment.loader(fixture);
    harness = await loader.getHarness(ZvFileInputHarness);

    detectChanges = () => {
      cmp._cd.markForCheck();
      fixture.detectChanges();
    };
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

    cmp.accept = ['.png', '.jpg'];
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

    expect(cmp.empty).toBeTrue();
    expect(await harness.getText()).toEqual(cmp.fileSelectText);

    cmp.value = new File([], 'test.png');
    detectChanges();

    expect(cmp.empty).toBeFalse();
    expect(await harness.getText()).toEqual('test.png');

    await harness.clickRemove();

    expect(cmp.empty).toBeTrue();
    expect(await harness.getText()).toEqual(cmp.fileSelectText);

    cmp.writeValue(new File([], 'test2.png'));
    detectChanges();

    expect(cmp.empty).toBeFalse();
    expect(await harness.getText()).toEqual('test2.png');

    cmp.onFileSelected({ target: { files: [new File([], 'test3.png')] } as unknown as HTMLInputElement } as unknown as Event);
    detectChanges();

    expect(cmp.empty).toBeFalse();
    expect(await harness.getText()).toEqual('test3.png');
  });
});
