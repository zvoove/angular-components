import '@angular/localize/init';

// Polyfill IntersectionObserver for jsdom (not needed in browser mode)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: readonly number[] = [];
  } as any;
}
