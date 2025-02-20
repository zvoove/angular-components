import { isPlatformServer } from '@angular/common';
import type { ElementRef } from '@angular/core';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
  inject,
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
export class ZvForm implements AfterViewInit, OnDestroy {
  @Input({ required: true }) public set dataSource(value: IZvFormDataSource) {
    if (this._dataSource) {
      this._dataSource.disconnect();
      this._dataSourceSub.unsubscribe();
    }

    this._dataSource = value;

    this.updateErrorCardObserver();

    if (this._dataSource) {
      this.activateDataSource();
    }
  }
  public get dataSource(): IZvFormDataSource {
    return this._dataSource;
  }
  private _dataSource!: IZvFormDataSource;

  public get autocomplete() {
    return this.dataSource.autocomplete;
  }

  public get form(): FormGroup {
    return this.dataSource.form;
  }

  public get buttons(): IZvButton[] {
    return this.dataSource.buttons;
  }

  public get progress(): number | null | undefined {
    return this.dataSource.progress;
  }

  public get showProgress(): boolean {
    return this.progress != null && this.progress >= 0;
  }

  public get savebarMode(): string {
    return this.dataSource.savebarMode || 'auto';
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
    return this.dataSource.contentVisible;
  }

  public get contentBlocked(): boolean {
    return this.dataSource.contentBlocked;
  }

  public get exception(): IZvException | null {
    return this.dataSource.exception;
  }

  @ViewChild('errorCardWrapper') public errorCardWrapper: ElementRef | null = null;

  private _dataSourceSub = Subscription.EMPTY;
  private _errorCardObserver: IntersectionObserver | null = null;
  private _viewReady = false;
  private _errrorInView$ = new BehaviorSubject<boolean>(false);
  private isServer = isPlatformServer(inject(PLATFORM_ID));

  constructor(private cd: ChangeDetectorRef) {}

  public ngAfterViewInit() {
    this._viewReady = true;
    this.updateErrorCardObserver();
    this.activateDataSource();
  }

  public ngOnDestroy() {
    if (this._errorCardObserver) {
      this._errorCardObserver.disconnect();
      this._errorCardObserver = null;
    }

    this._errrorInView$.complete();

    this._dataSourceSub.unsubscribe();
    if (this._dataSource) {
      this._dataSource.disconnect();
    }
  }

  private activateDataSource() {
    if (!this._viewReady || !this._dataSource) {
      return;
    }

    const options = {
      errorInView$: this._errrorInView$.pipe(distinctUntilChanged()),
      scrollToError: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        this.errorCardWrapper?.nativeElement.scrollIntoView({ behavior: 'smooth' });
      },
    } as IZvFormDataSourceConnectOptions;

    this._dataSourceSub = this._dataSource.connect(options).subscribe(() => {
      this.cd.markForCheck();
    });
  }

  private updateErrorCardObserver() {
    if (this.isServer) {
      return;
    }
    if (!this._errorCardObserver && this._dataSource && this._viewReady) {
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
      this._errorCardObserver.observe(this.errorCardWrapper?.nativeElement);
    } else if (this._errorCardObserver && !this._dataSource) {
      this._errorCardObserver.disconnect();
      this._errorCardObserver = null;
    }
  }
}
