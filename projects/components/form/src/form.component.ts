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
import { IPsFormSaveParams } from './models';

export class PsFormEvent {
  public defaultPrevented = false;

  public preventDefault() {
    this.defaultPrevented = true;
  }
}

export class PsFormLoadSuccessEvent extends PsFormEvent {
  constructor(public readonly value: any) {
    super();
  }
}
export class PsFormLoadErrorEvent extends PsFormEvent {
  constructor(public readonly error: any) {
    super();
  }
}

export class PsFormSaveSuccessEvent extends PsFormEvent {
  constructor(public readonly value: any, public readonly saveResponse: any, public readonly close: boolean) {
    super();
  }
}
export class PsFormSaveErrorEvent extends PsFormEvent {
  constructor(public readonly value: any, public readonly error: any) {
    super();
  }
}

export class PsFormCancelEvent extends PsFormEvent {}
@Component({
  selector: 'ps-form',
  template: `
    <form [formGroup]="form || dummyForm" [autocomplete]="autocomplete">
      <ps-savebar [form]="form" [mode]="savebarMode" (cancel)="onCancel()" [canSave]="canSaveIntern" [intlOverride]="intlOverride">
        <div class="ps-form__cards-container">
          <ps-block-ui *ngIf="!hasLoadError" [blocked]="viewBlocked">
            <ng-content></ng-content>
          </ps-block-ui>

          <mat-card *ngIf="hasLoadError" class="ps-form__error-container ps-form__error-container--center">
            <mat-icon class="ps-form__error-icon">sentiment_very_dissatisfied</mat-icon>
            <span>{{ errorMessage }}</span>
          </mat-card>

          <mat-card *ngIf="hasSaveError" class="ps-form__error-container">
            <span>{{ errorMessage }}</span>
          </mat-card>

          <mat-card *ngIf="hasLoadError" class="ps-form__error-actions">
            <button mat-stroked-button type="button" (click)="onCancel()">
              {{ intl.cancelLabel }}
            </button>
          </mat-card>
        </div>
      </ps-savebar>
    </form>
  `,
  styles: [
    `
      .ps-form__cards-container {
        display: grid;
        grid-gap: 1em;
      }

      .ps-form__error-container {
        color: var(--ps-error);
      }

      .ps-form__error-container--center {
        display: grid;
        justify-items: center;
      }

      .ps-form__error-icon {
        color: var(--ps-error);
        font-size: 72px;
        height: 72px;
        width: 72px;
      }

      .ps-form__error-actions {
        text-align: right;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsFormComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public form: FormGroup | null;
  @Input() public formMode: 'create' | 'update';
  @Input() public autocomplete: 'on' | 'off' = 'off';
  @Input() public hideSaveAndClose = false;
  @Input() public hideSave = false;
  @Input() public blocked = false;
  @Input() public canSave: boolean | null = null;
  @Input() public intlOverride: Partial<IPsFormIntlTexts>;

  @Input() public loadFnc: () => Observable<any>;
  @Input() public saveFnc: (formRawValue: any, params: IPsFormSaveParams) => Observable<any>;

  @Output() public loadSuccess = new EventEmitter<PsFormLoadSuccessEvent>();
  @Output() public loadError = new EventEmitter<PsFormLoadErrorEvent>();
  @Output() public saveSuccess = new EventEmitter<PsFormSaveSuccessEvent>();
  @Output() public saveError = new EventEmitter<PsFormSaveErrorEvent>();
  @Output() public cancel = new EventEmitter<PsFormCancelEvent>();

  @ViewChild(PsSavebarComponent, { static: true }) public set savebar(value: PsSavebarComponent) {
    if (value) {
      this._savebar = value;
      this.updateSaveBinding();
      this.updateSaveAndCloseBinding();
    }
  }

  public internalBlocked = false;
  public get viewBlocked(): boolean | null {
    return this.internalBlocked || this.blocked;
  }

  public hasLoadError = false;
  public hasSaveError = false;
  public errorMessage: string;
  public get canSaveIntern(): boolean | null {
    return this.viewBlocked ? false : this.canSave;
  }
  public intl: IPsFormIntlTexts;
  public get savebarMode(): string {
    return this.hasLoadError ? 'hide' : 'auto';
  }
  public dummyForm = new FormGroup({});

  private ngUnsubscribe$ = new Subject<void>();
  private _saveAndCloseSub: Subscription;
  private _saveSub: Subscription;
  private _loadSub: Subscription;
  private _savebar: PsSavebarComponent;

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
  }

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
