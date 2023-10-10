/* eslint-disable no-underscore-dangle */
import { BaseHarnessFilters, HarnessPredicate } from '@angular/cdk/testing';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing';
import { ZvTimeInputHarness } from './time-input.harness';

export type ZvDateTimeInputHarnessFilters = BaseHarnessFilters;

export class ZvDateTimeInputHarness extends MatFormFieldControlHarness {
  static hostSelector = 'zv-date-time-input';

  private _matDatepickerInput = this.locatorFor(MatDatepickerInputHarness);
  private _timeInput = this.locatorFor(ZvTimeInputHarness);

  static with(options: ZvDateTimeInputHarnessFilters = {}): HarnessPredicate<ZvDateTimeInputHarness> {
    return new HarnessPredicate(ZvDateTimeInputHarness, options);
  }

  async getDateInput(): Promise<MatDatepickerInputHarness> {
    return await this._matDatepickerInput();
  }

  async getTimeInput(): Promise<ZvTimeInputHarness> {
    return await this._timeInput();
  }

  async getInputs(): Promise<[MatDatepickerInputHarness, ZvTimeInputHarness]> {
    return [await this.getDateInput(), await this.getTimeInput()];
  }

  /** Gets the id of the input. */
  async getId(): Promise<string> {
    // The input directive always assigns a unique id to the input in
    // case no id has been explicitly specified.
    return await (await this.host()).getProperty<string>('id');
  }
}
