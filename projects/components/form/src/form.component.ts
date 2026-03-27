import { isPlatformServer } from '@angular/common';
import type { ElementRef } from '@angular/core';
import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ZvBlockUi } from '@zvoove/components/block-ui';
import { ZvButton } from '@zvoove/components/button';
import { IZvButton, IZvException, ZvErrorMessagePipe } from '@zvoove/components/core';
import { ZvFormErrors } from '@zvoove/components/form-errors';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { IZvFormDataSource, IZvFormDataSourceConnectOptions } from './form-data-source';

export const dependencies = {
  intersectionObserver: null as typeof IntersectionObserver | null,
};

@Component({
  selector: 'zv-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ReactiveFormsModule, ZvBlockUi, MatCard, MatCardContent, MatIcon, MatProgressBar, ZvFormErrors, ZvButton, ZvErrorMessagePipe],
})
export class ZvForm implements AfterViewInit, AfterViewChecked, OnDestroy {
  private readonly cd = inject(ChangeDetectorRef);

  public readonly dataSource = input.required<IZvFormDataSource>();

  public get autocomplete() {
    return this.dataSource().autocomplete;
  }

  public get form(): FormGroup {
    return this.dataSource().form;
  }

  public get buttons(): IZvButton[] {
    return this.dataSource().buttons;
  }

  public get progress(): number | null | undefined {
    return this.dataSource().progress;
  }

  public get showProgress(): boolean {
    return this.progress != null && this.progress >= 0;
  }

  public get savebarMode(): string {
    return this.dataSource().savebarMode || 'auto';
  }

  public get savebarHidden(): boolean {
    return this.savebarMode === 'hide';
  }

  public get savebarSticky(): boolean {
    if (this.savebarMode === 'auto') {
      return this.form.dirty || this.form.touched;
    }
    return this.savebarMode === 'sticky';
  }

  public get contentVisible(): boolean {
    return this.dataSource().contentVisible;
  }

  public get contentBlocked(): boolean {
    return this.dataSource().contentBlocked;
  }

  public get exception(): IZvException | null {
    return this.dataSource().exception;
  }

  public readonly errorCardWrapper = viewChild<ElementRef>('errorCardWrapper');

  private _dataSourceSub = Subscription.EMPTY;
  private _errorCardObserver: IntersectionObserver | null = null;
  private readonly _viewReady = signal(false);
  private _errrorInView$ = new BehaviorSubject<boolean>(false);
  private isServer = isPlatformServer(inject(PLATFORM_ID));

  constructor() {
    effect((onCleanup) => {
      const ds = this.dataSource();
      const ready = this._viewReady();
      untracked(() => {
        this.updateErrorCardObserver();
        if (ready) {
          this.activateDataSource();
        }
      });
      onCleanup(() => {
        this._dataSourceSub.unsubscribe();
        ds?.disconnect();
      });
    });
  }

  public ngAfterViewInit() {
    this._viewReady.set(true);
  }

  public ngAfterViewChecked() {
    this.updateErrorCardObserver();
  }

  public ngOnDestroy() {
    if (this._errorCardObserver) {
      this._errorCardObserver.disconnect();
      this._errorCardObserver = null;
    }

    this._errrorInView$.complete();
  }

  private activateDataSource() {
    const ds = this.dataSource();
    if (!this._viewReady() || !ds) {
      return;
    }

    const options = {
      errorInView$: this._errrorInView$.pipe(distinctUntilChanged()),
      scrollToError: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.errorCardWrapper()?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      },
    } as IZvFormDataSourceConnectOptions;

    this._dataSourceSub = ds.connect(options).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  private updateErrorCardObserver() {
    if (this.isServer) {
      return;
    }
    const ds = this.dataSource();
    const errorCardWrapper = this.errorCardWrapper();
    if (!this._errorCardObserver && ds && this._viewReady() && errorCardWrapper) {
      const options = {
        root: null, // relative to document viewport
        rootMargin: '-100px', // margin around root. Values are similar to css property. Unitless values not allowed
        threshold: 0, // visible amount of item shown in relation to root
      } as IntersectionObserverInit;

      const intersectionObserverCtor = dependencies.intersectionObserver ?? IntersectionObserver;
      this._errorCardObserver = new intersectionObserverCtor((changes) => {
        const isErrorCardInView = changes[0].intersectionRatio > 0;
        this._errrorInView$.next(isErrorCardInView);
        this.cd.markForCheck();
      }, options);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this._errorCardObserver.observe(errorCardWrapper.nativeElement);
    } else if (this._errorCardObserver && !ds) {
      this._errorCardObserver.disconnect();
      this._errorCardObserver = null;
    }
  }
}
