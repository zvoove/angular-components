import { vi } from 'vitest';
import { of, tap, throwError, timer } from 'rxjs';
import { ZvViewDataSource } from './view-data-source';

describe('ViewDataSource', () => {
  it('should create ViewDataSource', () => {
    const vds = new ZvViewDataSource({
      loadTrigger$: of({}),
      loadFn: () => of({}),
    });
    expect(vds).toBeTruthy();
  });

  describe('get contentBlocked', () => {
    it('should set contentBlocked', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of({}),
      });

      expect(vds.contentBlocked()).toBe(false);
      vds.setViewBlocked(true);
      expect(vds.contentBlocked()).toBe(true);
    });
  });

  describe('connect', () => {
    it('should load data and set result(s)', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of('loaded'),
      });
      vds.connect();
      expect(vds).toBeTruthy();
      expect(vds.result()).toEqual('loaded');
    });

    it('should throw if connect was called already', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of(),
      });
      vds.connect();
      expect(() => vds.connect()).toThrowError('ViewDataSource is already connected.');
      expect(vds.result()).toBeNull();
    });
  });

  describe('updateData', () => {
    it('should reload data and set result(s)', () => {
      let loadedData = 'loaded';
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of(loadedData),
      });
      vds.connect();
      expect(vds.result()).toEqual(loadedData);
      loadedData = 'reloaded';
      vds.updateData();
      expect(vds.result()).toEqual(loadedData);
    });

    it('should throw if connect was not called already', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of(),
      });
      expect(() => vds.updateData()).toThrowError('ViewDataSource is not connected.');
      expect(vds.result()).toBeNull();
    });
  });

  describe('contentVisible', () => {
    it('should return false if there is an error', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => throwError(() => new Error('oops')),
      });
      vds.connect();
      expect(vds.contentVisible()).toBe(false);
    });

    it('should return true if there is no error', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of({}),
      });
      vds.connect();
      expect(vds.contentVisible()).toBe(true);
    });
  });

  describe('exception', () => {
    it('should be set if an exception occured', () => {
      const error = new Error('oops');
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => throwError(() => error),
      });
      vds.connect();
      expect(vds.exception()?.errorObject).toEqual(error);
      expect(vds.exception()?.alignCenter).toBe(true);
      expect(vds.exception()?.icon).toBe('sentiment_very_dissatisfied');
      expect(vds.result()).toBeNull();
    });

    it('should be null if load does not error out', () => {
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => of({}),
      });
      vds.connect();
      expect(vds.exception()).toBeNull();
    });

    it('should be set if an exception occured on updateData', () => {
      let loadFn = of('loaded');
      const error = new Error('oops');
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => loadFn,
      });
      vds.connect();
      expect(vds.result()).toBe('loaded');
      expect(vds.exception()).toBeNull();
      loadFn = throwError(() => error);
      vds.updateData();
      expect(vds.exception()?.errorObject).toEqual(error);
      expect(vds.exception()?.alignCenter).toBe(true);
      expect(vds.exception()?.icon).toBe('sentiment_very_dissatisfied');
      expect(vds.result()).toBeNull();
    });
  });

  describe('disconnect', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('this just shows, that the timer is actually respected', async () => {
      let loadFnCalled = false;
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => timer(1000).pipe(tap(() => (loadFnCalled = true))),
      });
      vds.connect();
      expect(loadFnCalled).toBe(false);
      await vi.advanceTimersByTimeAsync(1000);
      expect(loadFnCalled).toBe(true);
      vds.disconnect();
    });

    it('should cancel connectSub', async () => {
      let loadFnCalled;
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => timer(1000).pipe(tap(() => (loadFnCalled = true))),
      });
      vds.connect();
      expect(loadFnCalled).toBeUndefined();
      vds.disconnect();
      await vi.advanceTimersByTimeAsync(1000);
      expect(loadFnCalled).toBeUndefined();
      expect(vds.result()).toBeNull();
    });

    it('should cancel loadingSub', async () => {
      let loadFnCalled;
      const vds = new ZvViewDataSource({
        loadTrigger$: of({}),
        loadFn: () => timer(1000).pipe(tap(() => (loadFnCalled = false))),
      });
      vds.connect();
      expect(loadFnCalled).toBeUndefined();
      vds.updateData();
      vds.disconnect();
      await vi.advanceTimersByTimeAsync(1000);
      expect(loadFnCalled).toBeUndefined();
    });
  });
});
