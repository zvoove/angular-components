import { DestroyRef, assertInInjectionContext, inject } from '@angular/core';
import { ReplaySubject } from 'rxjs';

/**
 * Injects the `DestroyRef` service and returns a `ReplaySubject` that emits
 * when the component is destroyed.
 *
 * @throws {Error} If no `DestroyRef` is found.
 * @returns {ReplaySubject<void>} A `ReplaySubject` that emits when the component is destroyed.
 *
 * @example
 * // In your component:
 * export class MyComponent {
 *   private destroy$ = injectDestroy();
 *
 *   getData() {
 *     return this.service.getData()
 *       .pipe(takeUntil(this.destroy$))
 *       .subscribe(data => { ... });
 *   }
 * }
 */
export const injectDestroy = (): ReplaySubject<void> => {
  assertInInjectionContext(injectDestroy);

  const destroyRef = inject(DestroyRef);
  const subject$ = new ReplaySubject<void>(1);

  destroyRef.onDestroy(() => {
    subject$.next();
    subject$.complete();
  });

  return subject$;
};
