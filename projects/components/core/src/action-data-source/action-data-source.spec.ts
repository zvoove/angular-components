import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { switchMap, throwError, timer } from 'rxjs';
import { ZvActionDataSource } from './action-data-source';

describe('ActionDataSource', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({});
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should set properties correctly', async () => {
    let dataSource: ZvActionDataSource;
    TestBed.runInInjectionContext(() => {
      dataSource = new ZvActionDataSource({ actionFn: () => timer(1) });
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(false);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);

      dataSource.execute();
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(true);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);
    });

    await vi.advanceTimersByTimeAsync(1);
    expect(dataSource.error()).toBe(null);
    expect(dataSource.isLoading()).toBe(false);
    expect(dataSource.hasError()).toBe(false);
    expect(dataSource.succeeded()).toBe(true);
  });

  it('should set error correctly', async () => {
    const error = new Error('action failed');
    let dataSource: ZvActionDataSource;
    TestBed.runInInjectionContext(() => {
      dataSource = new ZvActionDataSource({ actionFn: () => timer(1).pipe(switchMap(() => throwError(() => error))) });
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(false);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);

      dataSource.execute();
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(true);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);
    });

    await vi.advanceTimersByTimeAsync(1);
    expect(dataSource.error()).toBe(error);
    expect(dataSource.isLoading()).toBe(false);
    expect(dataSource.hasError()).toBe(true);
    expect(dataSource.succeeded()).toBe(false);
  });
});
