import { fakeAsync, tick } from '@angular/core/testing';
import { switchMap, throwError, timer } from 'rxjs';
import { ZvActionDataSource } from './action-data-source';

describe('ActionDataSource', () => {
  it('should set properties correctly', fakeAsync(() => {
    const dataSource = new ZvActionDataSource({ actionFn: () => timer(1) });
    expect(dataSource.exception()).toBe(null);
    expect(dataSource.pending()).toBe(false);
    expect(dataSource.hasError()).toBe(false);
    expect(dataSource.succeeded()).toBe(false);

    dataSource.execute();
    expect(dataSource.exception()).toBe(null);
    expect(dataSource.pending()).toBe(true);
    expect(dataSource.hasError()).toBe(false);
    expect(dataSource.succeeded()).toBe(false);

    tick(1);
    expect(dataSource.exception()).toBe(null);
    expect(dataSource.pending()).toBe(false);
    expect(dataSource.hasError()).toBe(false);
    expect(dataSource.succeeded()).toBe(true);
  }));

  it('should set error correctly', fakeAsync(() => {
    const error = new Error('action failed');
    const dataSource = new ZvActionDataSource({ actionFn: () => timer(1).pipe(switchMap(() => throwError(() => error))) });
    expect(dataSource.exception()).toBe(null);
    expect(dataSource.pending()).toBe(false);
    expect(dataSource.hasError()).toBe(false);
    expect(dataSource.succeeded()).toBe(false);

    dataSource.execute();
    expect(dataSource.exception()).toBe(null);
    expect(dataSource.pending()).toBe(true);
    expect(dataSource.hasError()).toBe(false);
    expect(dataSource.succeeded()).toBe(false);

    tick(1);
    expect(dataSource.exception()?.errorObject).toBe(error);
    expect(dataSource.pending()).toBe(false);
    expect(dataSource.hasError()).toBe(true);
    expect(dataSource.succeeded()).toBe(false);
  }));
});
