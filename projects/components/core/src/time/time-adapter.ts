import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class ZvTimeAdapter<TTime> {
  abstract is24HourFormat(): boolean;

  /**
   * Creates a time with the given hour and minute. Does not allow over/under-flow.
   * @param hour The hour of the time in 24 hour format. Must be an integer 0 - 23.
   * @param minute The minute of the time. Must be an integer 0 - 59.
   * @returns The new time, or null if invalid.
   */
  abstract createTime(hour: number, minute: number): TTime;

  /**
   * Parses a time from a user-provided value.
   * @param value The value to parse.
   * @param parseFormat The expected format of the value being parsed
   *     (type is implementation-dependent).
   * @returns The parsed time.
   */
  abstract parse(value: unknown, parseFormat: unknown): TTime | null;

  /**
   * Formats a time as a string according to the given format.
   * @param time The value to format.
   * @param displayFormat The format to use to display the time as a string.
   * @returns The formatted time string.
   */
  abstract format(time: TTime | null, displayFormat: unknown): string | null;

  /**
   * Given a potential date object, returns that same date object if it is
   * a valid date, or `null` if it's not a valid date.
   * @param obj The object to check.
   * @returns A date or `null`.
   */
  getValidTimeOrNull(obj: unknown): TTime | null {
    return this.isTimeInstance(obj) && this.isValid(obj as TTime) ? (obj as TTime) : null;
  }

  /**
   * Checks whether the given object is considered a time instance by this Adapter.
   * @param obj The object to check
   * @returns Whether the object is a time instance.
   */
  abstract isTimeInstance(obj: unknown): boolean;

  /**
   * Checks whether the given time is valid.
   * @param time The time to check.
   * @returns Whether the time is valid.
   */
  abstract isValid(time: TTime): boolean;

  /**
   * Gets time instance that is not valid.
   * @returns An invalid time.
   */
  abstract invalid(): TTime;

  /**
   * Attempts to deserialize a value to a valid time object. This is different from parsing in that
   * deserialize should only accept non-ambiguous, locale-independent formats (e.g. a ISO 8601
   * string). The default implementation does not allow any deserialization, it simply checks that
   * the given value is already a valid time object or null. The `<zv-date-time-input>` will call this
   * method on all of its `@Input()` properties that accept times. It is therefore possible to
   * support passing values from your backend directly to these properties by overriding this method
   * to also deserialize the format used by your backend.
   * @param value The value to be deserialized into a time object.
   * @returns The deserialized time object, either a valid time, null if the value can be
   *     deserialized into a null time (e.g. the empty string), or an invalid time.
   */
  deserialize(value: any): TTime | null {
    if (!value) {
      return null;
    }
    if (this.isTimeInstance(value) && this.isValid(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const matches = value.match(/^(\d{2}):(\d{2})$/);
      if (matches) {
        return this.createTime(+matches[1], +matches[2]);
      }
    }
    return this.invalid();
  }

  /**
   * Compares two times.
   * @param first The first time to compare.
   * @param second The second time to compare.
   * @returns 0 if the times are equal, a number less than 0 if the first time is earlier,
   *     a number greater than 0 if the first time is later.
   */
  abstract compareTime(first: TTime, second: TTime): number;

  /**
   * Checks if two times are equal.
   * @param first The first time to check.
   * @param second The second time to check.
   * @returns Whether the two times are equal.
   *     Null times are considered equal to other null times.
   */
  sameTime(first: TTime | null, second: TTime | null): boolean {
    if (first && second) {
      const firstValid = this.isValid(first);
      const secondValid = this.isValid(second);
      if (firstValid && secondValid) {
        return !this.compareTime(first, second);
      }
      return firstValid == secondValid;
    }
    return first == second;
  }

  /**
   * returns an example for the user how he should provide the time
   */
  abstract parseFormatExample(): string;
}
