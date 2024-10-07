import { BaseHarnessFilters, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatOptionHarness, OptionHarnessFilters } from '@angular/material/core/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing/control';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { MatSelectHarness } from '@angular/material/select/testing';

/** A set of criteria that can be used to filter a list of `MatSelectHarness` instances. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ZvSelectHarnessFilters extends BaseHarnessFilters {}

/** Harness for interacting with a standard mat-select in tests. */
export class ZvSelectHarness extends MatFormFieldControlHarness {
  static hostSelector = 'zv-select';

  private _matSelect = this.locatorFor(MatSelectHarness);
  private _documentRootLocator = this.documentRootLocatorFactory();

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `ZvSelectHarness` that meets
   * certain criteria.
   *
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ZvSelectHarnessFilters = {}): HarnessPredicate<ZvSelectHarness> {
    return new HarnessPredicate(ZvSelectHarness, options);
  }

  /** Gets a boolean promise indicating if the select is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this._matSelect()).isDisabled();
  }

  /** Gets a boolean promise indicating if the select is valid. */
  async isValid(): Promise<boolean> {
    return !(await (await this._matSelect()).isValid());
  }

  /** Gets a boolean promise indicating if the select is required. */
  async isRequired(): Promise<boolean> {
    return (await this._matSelect()).isRequired();
  }

  /** Gets a boolean promise indicating if the select is empty (no value is selected). */
  async isEmpty(): Promise<boolean> {
    return (await this._matSelect()).isEmpty();
  }

  /** Gets a boolean promise indicating if the select is in multi-selection mode. */
  async isMultiple(): Promise<boolean> {
    return (await this._matSelect()).isMultiple();
  }

  /** Gets a promise for the select's value text. */
  async getValueText(): Promise<string> {
    return (await this._matSelect()).getValueText();
  }

  /** Focuses the select and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this._matSelect()).focus();
  }

  /** Blurs the select and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this._matSelect()).blur();
  }

  /** Whether the select is focused. */
  async isFocused(): Promise<boolean> {
    return (await this._matSelect()).isFocused();
  }

  /** Gets the options inside the select panel. */
  async getOptions(filter: Omit<OptionHarnessFilters, 'ancestor'> = {}): Promise<MatOptionHarness[]> {
    const options = await (await this._matSelect()).getOptions(filter);
    const result = [];
    for (const option of options) {
      const host = await option.host();
      if (await host.hasClass('zv-select__search')) {
        continue;
      }
      result.push(option);
    }
    return result;
  }

  // OptionGroups are not supported at the moment
  //   /** Gets the groups of options inside the panel. */
  //   async getOptionGroups(filter: Omit<OptgroupHarnessFilters, 'ancestor'> = {}): Promise<MatOptgroupHarness[]> {
  //     return (await this._matSelect()).getOptionGroups(filter);
  //   }

  /** Gets whether the select is open. */
  async isOpen(): Promise<boolean> {
    return (await this._matSelect()).isOpen();
  }

  /** Opens the select's panel. */
  async open(): Promise<void> {
    return (await this._matSelect()).open();
  }

  /**
   * Clicks the options that match the passed-in filter. If the select is in multi-selection
   * mode all options will be clicked, otherwise the harness will pick the first matching option.
   */
  async clickOptions(filter: OptionHarnessFilters = {}): Promise<void> {
    await this.open();

    const [isMultiple, options] = await Promise.all([this.isMultiple(), this.getOptions(filter)]);

    if (options.length === 0) {
      throw Error('Select does not have options matching the specified filter');
    }

    if (isMultiple) {
      await Promise.all(options.map((option) => option.click()));
    } else {
      await options[0].click();
    }
  }

  /** Closes the select's panel. */
  async close(): Promise<void> {
    return (await this._matSelect()).close();
  }

  /** Gets a boolean promise indicating if the select is in the error state. */
  async isErrorState(): Promise<boolean> {
    return await (await this.host()).hasClass('zv-select-invalid');
  }

  /** Gets the option that clears the selected value. */
  async getEmptyOption() {
    const options = await this.getOptions({ text: '--' });
    for (const option of options) {
      if (await (await option.host()).hasClass('zv-select__empty-option')) {
        return option;
      }
    }

    return null;
  }

  /** Gets the option that shows the error message. */
  async getErrorOption() {
    const options = await this.getOptions();
    for (const option of options) {
      if (await (await option.host()).hasClass('zv-select__error')) {
        return option;
      }
    }

    return null;
  }

  /** Gets the panel header. */
  async getPanelHeader() {
    return this._documentRootLocator.locatorFor(
      ZvSelectPanelHeaderHarness.with({
        ancestor: await this._getPanelSelector(),
      })
    )();
  }

  /** Gets the selector that should be used to find this select's panel. */
  private async _getPanelSelector(): Promise<string> {
    const id = await (await (await this._matSelect()).host()).getAttribute('id');
    return `#${id}-panel`;
  }
}

/** Harness for interacting with a `mat-option` in tests. */
export class ZvSelectPanelHeaderHarness extends ComponentHarness {
  /** Selector used to locate option instances. */
  static hostSelector = '.zv-select__search';

  private _loadingSpinner = this.locatorForOptional(MatProgressSpinnerHarness);
  private _filter = this.locatorFor('.mat-select-search-inner > .mat-select-search-inner-row > input.mat-select-search-input');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatOptionsHarness` that meets
   * certain criteria.
   *
   * @param options Options for filtering which option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: BaseHarnessFilters = {}) {
    return new HarnessPredicate(ZvSelectPanelHeaderHarness, options);
  }

  /** Gets the toggle all checkbox. */
  getToggleAll = this.locatorForOptional(MatCheckboxHarness);

  /** Gets the filter input. */
  async setFilter(newValue: string) {
    const inputEl = await this._filter();
    await inputEl.clear();

    // We don't want to send keys for the value if the value is an empty
    // string in order to clear the value. Sending keys with an empty string
    // still results in unnecessary focus events.
    if (newValue) {
      await inputEl.sendKeys(newValue);
    }

    // Some input types won't respond to key presses (e.g. `color`) so to be sure that the
    // value is set, we also set the property after the keyboard sequence. Note that we don't
    // want to do it before, because it can cause the value to be entered twice.
    await inputEl.setInputValue(newValue);
  }

  /** Gets whether the loading spinner is shown. */
  async isLoading() {
    const spinner = await this._loadingSpinner();
    return !!spinner;
  }
}
