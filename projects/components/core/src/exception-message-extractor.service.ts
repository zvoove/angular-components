import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ZvExceptionMessageExtractor {
  /**
   * Extracts a error message from a given error object
   *
   * @param error The error object.
   * @returns The error message
   */
  public extractErrorMessage(error: unknown): string | null {
    if (!error) {
      return null;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object') {
      return (error as Error).message ?? null;
    }

    return null;
  }
}
