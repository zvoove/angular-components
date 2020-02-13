import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IPsFormIntlTexts, PsExceptionMessageExtractor, PsIntlService } from '@prosoft/components/core';
import { PsSavebarComponent } from '@prosoft/components/savebar';
import { Observable, Subject, Subscription } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { PsFormActionService } from './form-action.service';
import { IPsFormButton, IPsFormDataSource, IPsFormException } from './form-data-source';
import { IPsFormSaveParams } from './models';

/** @deprecated */
export class PsFormEvent {
  public defaultPrevented = false;

  public preventDefault() {
    this.defaultPrevented = true;
  }
}

/** @deprecated */
export class PsFormLoadSuccessEvent extends PsFormEvent {
  constructor(public readonly value: any) {
    super();
  }
}
/** @deprecated */
export class PsFormLoadErrorEvent extends PsFormEvent {
  constructor(public readonly error: any) {
    super();
  }
}

/** @deprecated */
export class PsFormSaveSuccessEvent extends PsFormEvent {
  constructor(public readonly value: any, public readonly saveResponse: any, public readonly close: boolean) {
    super();
  }
}
/** @deprecated */
export class PsFormSaveErrorEvent extends PsFormEvent {
  constructor(public readonly value: any, public readonly error: any) {
    super();
  }
}

/** @deprecated */
export class PsFormCancelEvent extends PsFormEvent {}

@Component({
  selector: 'ps-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsFormComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public set dataSource(value: IPsFormDataSource) {
    if (this._dataSource) {
      this._dataSource.disconnect();
      this._dataSourceSub.unsubscribe();
    }

    this._dataSource = value;

    if (this._dataSource) {
      this._dataSourceSub = this._dataSource.connect().subscribe(() => {
        this.cd.markForCheck();
      });
    }
  }
  public get dataSource(): IPsFormDataSource {
    return this._dataSource;
  }
  private _dataSource: IPsFormDataSource;

  public get boundForm(): FormGroup {
    if (this.dataSource) {
      return this.dataSource.form;
    }
    return this.form || this.dummyForm;
  }
  public get buttons(): IPsFormButton[] {
    return this.dataSource.buttons;
  }
  public get savebarMode(): string {
    if (this.dataSource) {
      return this.dataSource.savebarMode;
    }
    return this.hasLoadError ? 'hide' : 'auto';
  }
  public get contentVisible(): boolean {
    return this.dataSource.contentVisible;
  }
  public get contentBlocked(): boolean {
    return this.dataSource.contentBlocked;
  }
  public get exception(): IPsFormException {
    return this.dataSource.exception;
  }
  public get exceptionMessage(): string {
    // TODO: pipe
    return this.dataSource.exception ? this.errorExtractor.extractErrorMessage(this.dataSource.exception.errorObject) : '';
  }

  /** @deprecated */
  @Input() public form: FormGroup | null;
  /** @deprecated */
  @Input() public formMode: 'create' | 'update';
  /** @deprecated */
  @Input() public autocomplete: 'on' | 'off' = 'off';
  /** @deprecated */
  @Input() public hideSaveAndClose = false;
  /** @deprecated */
  @Input() public hideSave = false;
  /** @deprecated */
  @Input() public blocked = false;
  /** @deprecated */
  @Input() public canSave: boolean | null = null;
  /** @deprecated */
  @Input() public intlOverride: Partial<IPsFormIntlTexts>;

  /** @deprecated */
  @Input() public loadFnc: () => Observable<any>;
  /** @deprecated */
  @Input() public saveFnc: (formRawValue: any, params: IPsFormSaveParams) => Observable<any>;

  /** @deprecated */
  @Output() public loadSuccess = new EventEmitter<PsFormLoadSuccessEvent>();
  /** @deprecated */
  @Output() public loadError = new EventEmitter<PsFormLoadErrorEvent>();
  /** @deprecated */
  @Output() public saveSuccess = new EventEmitter<PsFormSaveSuccessEvent>();
  /** @deprecated */
  @Output() public saveError = new EventEmitter<PsFormSaveErrorEvent>();
  /** @deprecated */
  @Output() public cancel = new EventEmitter<PsFormCancelEvent>();

  @ViewChild(PsSavebarComponent, { static: false }) public set savebar(value: PsSavebarComponent) {
    if (value) {
      this._savebar = value;
      this.updateSaveBinding();
      this.updateSaveAndCloseBinding();
    }
  }

  /** @deprecated */
  public internalBlocked = false;
  /** @deprecated */
  public get viewBlocked(): boolean | null {
    return this.internalBlocked || this.blocked;
  }

  /** @deprecated */
  public hasLoadError = false;
  /** @deprecated */
  public hasSaveError = false;
  /** @deprecated */
  public errorMessage: string;
  /** @deprecated */
  public get canSaveIntern(): boolean | null {
    return this.viewBlocked ? false : this.canSave;
  }
  /** @deprecated */
  public intl: IPsFormIntlTexts;
  public dummyForm = new FormGroup({});

  private ngUnsubscribe$ = new Subject<void>();
  private _saveAndCloseSub: Subscription;
  private _saveSub: Subscription;
  private _loadSub: Subscription;
  private _savebar: PsSavebarComponent;
  private _dataSourceSub = Subscription.EMPTY;

  constructor(
    @Optional() public actionService: PsFormActionService,
    public intlService: PsIntlService,
    private errorExtractor: PsExceptionMessageExtractor,
    @Optional() private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  public ngOnInit() {
    this.intlService.intlChanged$
      .pipe(
        startWith(null as any),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(() => {
        this.updateIntl();
        this.cd.markForCheck();
      });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.intlOverride) {
      this.updateIntl();
    }

    if (changes.loadFnc) {
      this.loadData();
    }

    if (changes.dataSource) {
      this.hideSave = true;
      this.hideSaveAndClose = true;
    }

    if (this._savebar) {
      if (changes.hideSave) {
        this.updateSaveBinding();
      }
      if (changes.hideSaveAndClose) {
        this.updateSaveAndCloseBinding();
      }
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();

    if (this._loadSub) {
      this._loadSub.unsubscribe();
    }
    if (this._saveSub) {
      this._saveSub.unsubscribe();
    }
    if (this._saveAndCloseSub) {
      this._saveAndCloseSub.unsubscribe();
    }

    this._dataSourceSub.unsubscribe();
    if (this._dataSource) {
      this._dataSource.disconnect();
    }
  }

  /** @deprecated */
  public loadData() {
    this.internalBlocked = true;
    this.errorMessage = null;
    this.hasLoadError = false;
    this.hasSaveError = false;
    this.cd.markForCheck();

    if (this._loadSub) {
      this._loadSub.unsubscribe();
    }
    this._loadSub = this.loadFnc().subscribe({
      next: (value: any) => {
        this.internalBlocked = false;

        const event = new PsFormLoadSuccessEvent(value);
        this.loadSuccess.emit(event);
        if (this.actionService && !event.defaultPrevented) {
          this.actionService.defaultLoadSuccessHandler({
            value: value,
            form: this.form,
            formMode: this.formMode,
            route: this.route,
          });
        }

        this.cd.markForCheck();
      },
      error: (error: any) => {
        this.internalBlocked = false;
        this.errorMessage = this.errorExtractor.extractErrorMessage(error);
        this.hasLoadError = true;

        const event = new PsFormLoadErrorEvent(error);
        this.loadError.emit(event);
        if (this.actionService && !event.defaultPrevented) {
          this.actionService.defaultLoadErrorHandler({
            error: error,
            form: this.form,
            formMode: this.formMode,
            route: this.route,
          });
        }

        this.cd.markForCheck();
      },
    });
  }

  /** @deprecated */
  public onSave(close: boolean) {
    this.internalBlocked = true;
    this.errorMessage = null;
    this.hasSaveError = false;
    this.cd.markForCheck();

    const formValue = (this.form && this.form.getRawValue()) || null;
    const saveParams: IPsFormSaveParams = {
      close: close,
    };
    this.saveFnc(formValue, saveParams)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe({
        next: (saveResult: any) => {
          this.internalBlocked = false;

          const event = new PsFormSaveSuccessEvent(formValue, saveResult, close);
          this.saveSuccess.emit(event);
          if (this.actionService && !event.defaultPrevented) {
            this.actionService.defaultSaveSuccessHandler({
              value: formValue,
              saveResult: saveResult,
              close: close,
              form: this.form,
              formMode: this.formMode,
              route: this.route,
            });
          }

          this.cd.markForCheck();
        },
        error: (error: any) => {
          this.internalBlocked = false;
          this.errorMessage = this.errorExtractor.extractErrorMessage(error);
          this.hasSaveError = true;

          const event = new PsFormSaveErrorEvent(formValue, error);
          this.saveError.emit(event);
          if (this.actionService && !event.defaultPrevented) {
            this.actionService.defaultSaveErrorHandler({
              value: formValue,
              error: error,
              close: close,
              form: this.form,
              formMode: this.formMode,
              route: this.route,
            });
          }

          this.cd.markForCheck();
        },
      });
  }

  /** @deprecated */
  public onCancel() {
    const event = new PsFormCancelEvent();
    this.cancel.emit(event);
    if (this.actionService && !event.defaultPrevented) {
      this.actionService.defaultCancelHandler({
        formMode: this.formMode,
        route: this.route,
      });
    }
  }

  private updateIntl() {
    const intl = this.intlService.get('form');
    this.intl = this.intlService.merge(intl, this.intlOverride);
  }

  private updateSaveBinding() {
    if (this._saveSub) {
      this._saveSub.unsubscribe();
    }

    if (!this.hideSave) {
      this._saveSub = this._savebar.save.subscribe(() => this.onSave(false));
    }
    this._savebar.cd.markForCheck();
  }

  private updateSaveAndCloseBinding() {
    if (this._saveAndCloseSub) {
      this._saveAndCloseSub.unsubscribe();
    }

    if (!this.hideSaveAndClose) {
      this._saveAndCloseSub = this._savebar.saveAndClose.subscribe(() => this.onSave(true));
    }
    this._savebar.cd.markForCheck();
  }
}
