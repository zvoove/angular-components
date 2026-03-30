import { Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { interval, takeUntil } from 'rxjs';
import { injectDestroy } from './inject-destroy';

describe('injectDestroy', () => {
  describe('emits when the component is destroyed using takeUntil', () => {
    // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
    @Component({ standalone: true, template: '' })
    class TestComponent implements OnInit {
      destroy$ = injectDestroy();
      count = 0;

      ngOnInit() {
        interval(1000)
          .pipe(takeUntil(this.destroy$))
          .subscribe(() => this.count++);
      }
    }

    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
      vi.useFakeTimers();
      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance;
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle async stuff', async () => {
      fixture.detectChanges();

      expect(component.count).toBe(0);
      await vi.advanceTimersByTimeAsync(1000);
      expect(component.count).toBe(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(component.count).toBe(2);

      fixture.destroy(); // destroy the component here

      await vi.advanceTimersByTimeAsync(1000);
      expect(component.count).toBe(2);
    });
  });
});
