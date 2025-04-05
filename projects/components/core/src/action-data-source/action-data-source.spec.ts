import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { switchMap, throwError, timer } from 'rxjs';
import { ZvActionDataSource } from './action-data-source';

describe('ActionDataSource', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({});
  });
  it('should set properties correctly', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const dataSource = new ZvActionDataSource({ actionFn: () => timer(1) });
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(false);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);

      dataSource.execute();
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(true);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);

      tick(1);
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(false);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(true);
    });
  }));

  it('should set error correctly', fakeAsync(() => {
    TestBed.runInInjectionContext(() => {
      const error = new Error('action failed');
      const dataSource = new ZvActionDataSource({ actionFn: () => timer(1).pipe(switchMap(() => throwError(() => error))) });
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(false);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);

      dataSource.execute();
      expect(dataSource.error()).toBe(null);
      expect(dataSource.isLoading()).toBe(true);
      expect(dataSource.hasError()).toBe(false);
      expect(dataSource.succeeded()).toBe(false);

      tick(1);
      expect(dataSource.error()).toBe(error);
      expect(dataSource.isLoading()).toBe(false);
      expect(dataSource.hasError()).toBe(true);
      expect(dataSource.succeeded()).toBe(false);
    });
  }));
});
