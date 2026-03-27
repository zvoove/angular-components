import '@angular/localize/init';

// Polyfill IntersectionObserver for jsdom (not needed in browser mode)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
      /* noop */
    }
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: readonly number[] = [];
  } as unknown as typeof IntersectionObserver;
}
