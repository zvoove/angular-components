/* eslint-disable no-underscore-dangle */
import { BaseHarnessFilters, ContentContainerComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';

export type ZvFileInputHarnessFilters = BaseHarnessFilters;

export const enum ZvFileInputSection {
  text = '.app-file-input__text',
  removeButton = '.app-file-input__remove',
  input = 'input',
}

export class ZvFileInputHarness extends ContentContainerComponentHarness<ZvFileInputSection> {
  static hostSelector = 'zv-file-input';

  private _text = this.locatorFor(ZvFileInputSection.text);
  private _input = this.locatorFor(ZvFileInputSection.input);
  private _removeButton = this.locatorFor(ZvFileInputSection.removeButton);

  static with(options: ZvFileInputHarnessFilters = {}): HarnessPredicate<ZvFileInputHarness> {
    return new HarnessPredicate(ZvFileInputHarness, options);
  }

  async getText(): Promise<string> {
    return (await this._text()).text();
  }

  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this._input()).getProperty<boolean>('disabled');
  }

  /** Whether the input is required. */
  async isRequired(): Promise<boolean> {
    return (await this._input()).getProperty<boolean>('required');
  }

  /** Whether the input is readonly. */
  async isReadonly(): Promise<boolean> {
    return (await this._input()).getProperty<boolean>('readOnly');
  }

  /** Gets the placeholder of the input. */
  async getPlaceholder(): Promise<string> {
    const host = await this._input();
    const [nativePlaceholder, fallback] = await parallel(() => [host.getProperty('placeholder'), host.getAttribute('data-placeholder')]);
    return nativePlaceholder || fallback || '';
  }

  /** Gets the accept of the file input. */
  async getAccept(): Promise<string> {
    const input = await this._input();
    const accept = await input.getAttribute('accept');
    return accept || '';
  }

  /** Gets the id of the input. */
  async getId(): Promise<string> {
    // The input directive always assigns a unique id to the input in
    // case no id has been explicitly specified.
    return await (await this.host()).getProperty<string>('id');
  }

  /**
   * clears the file input and returns a promise that indicates when the
   * action is complete.
   */
  async clickRemove(): Promise<void> {
    return (await this._removeButton()).click();
  }
}
