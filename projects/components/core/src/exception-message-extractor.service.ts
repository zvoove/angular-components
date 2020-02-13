import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PsExceptionMessageExtractor {
  /**
   * Extracts a error message from a given error object
   * @param error The error object.
   * @returns The error message
   */
  public extractErrorMessage(error: any): string {
    if (!error) {
      return null;
    }

    if (typeof error === 'string') {
      return error;
    }

    return error.message;
  }
}
