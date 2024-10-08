import { FormGroup } from '@angular/forms';
import { IZvButton, IZvException } from '@zvoove/components/core';
import { IZvFormDataSource, IZvSavebarMode } from '@zvoove/components/form';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { first } from 'rxjs/operators';

export interface FormDataSourceOptions<
  TTriggerData,
  TLoadData,
  TSaveResponse,
  TForm extends FormGroup = FormGroup,
  TFormValue = ReturnType<TForm['getRawValue']>,
> {
  form: TForm;
  loadTrigger$?: Observable<TTriggerData>;
  loadFn?: (params: TTriggerData | null) => Observable<TLoadData>;
  saveFn: (
    formValue: TFormValue,
    options: { loadParams: TTriggerData | null; progressCallback: (progress: number) => void }
  ) => Observable<TSaveResponse>;
  navigateFn?: (
    ctx:
      | { close: boolean; save: false }
      | {
          close: boolean;
          save: true;
          loadParams: TTriggerData | null;
          savedData: TFormValue;
          saveResponse: TSaveResponse;
        }
  ) => void;
  btnConfigFn?: (btns: { save: IZvButton | null; saveAndClose: IZvButton | null; cancel: IZvButton | null }) => void;
  savebarMode?: IZvSavebarMode;
  autocomplete?: 'off' | 'on';
}

export class FormDataSource<
  TTriggerData,
  TLoadData,
  TSaveResponse,
  TForm extends FormGroup = FormGroup,
  TFormValue = ReturnType<TForm['getRawValue']>,
> implements IZvFormDataSource
{
  public buttons: IZvButton[] = [];
  public exception: IZvException | null = null;
  public progress: number | null = null;

  private loading = false;
  private hasLoadError = false;
  private saving = false;
  private blockView = false;
  private stateChanges$!: Subject<void>;
  private loadParams: TTriggerData | null = null;
  private loadingSub = Subscription.EMPTY;
  private connectSub = Subscription.EMPTY;
  private buttonDefs = {
    save: {
      label: $localize`:@@general.save:Speichern`,
      type: 'flat',
      color: 'primary',
      dataCy: 'saveButton',
      disabled: () => this.contentBlocked || this.form.pristine,
      click: () => this.save(false),
    } as IZvButton,
    saveAndClose: {
      label: $localize`:@@general.save:Speichern` + ' & ' + $localize`:@@general.close:Schließen`,
      type: 'flat',
      color: 'primary',
      dataCy: 'saveAndCloseButton',
      disabled: () => this.contentBlocked || this.form.pristine,
      click: () => this.save(true),
    } as IZvButton,
    cancel: {
      label: $localize`:@@general.cancel:Abbrechen`,
      type: 'stroked',
      color: null,
      dataCy: 'cancelButton',
      disabled: () => false,
      click: () => this.close(),
    } as IZvButton,
  };

  constructor(private options: FormDataSourceOptions<TTriggerData, TLoadData, TSaveResponse, TForm, TFormValue>) {
    if (options.btnConfigFn) {
      options.btnConfigFn(this.buttonDefs);
    }
  }

  public get form(): TForm {
    return this.options.form;
  }
  public get contentVisible(): boolean {
    return !this.hasLoadError;
  }
  public get contentBlocked(): boolean {
    return this.loading || this.saving || this.blockView;
  }
  public get savebarMode(): IZvSavebarMode {
    return this.options.savebarMode ?? 'auto';
  }
  public get autocomplete(): 'off' | 'on' {
    return this.options.autocomplete ?? 'off';
  }

  public connect(): Observable<void> {
    this.stateChanges$ = new Subject<void>();
    const loadTrigger$: Observable<TTriggerData | null> = this.options.loadTrigger$ || of(null);
    this.connectSub = loadTrigger$.subscribe((params) => {
      this.loadParams = params;
      this.loadData(params);
    });
    return this.stateChanges$;
  }

  public disconnect(): void {
    this.connectSub.unsubscribe();
    this.stateChanges$.complete();
    this.stateChanges$ = new Subject();
  }

  public setViewBlocked(value: boolean): void {
    this.blockView = value;
    this.stateChanges$.next();
  }

  public setProgress(value: number | null): void {
    this.progress = value;
    this.stateChanges$.next();
  }

  public updateButtonDefs(
    btnConfigFn: (btns: { save: IZvButton | null; saveAndClose: IZvButton | null; cancel: IZvButton | null }) => void
  ) {
    btnConfigFn(this.buttonDefs);
    this.updateButtons();
    this.stateChanges$.next();
  }

  public save(close: boolean): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    this.saving = true;
    this.exception = null;
    this.progress = null;
    this.updateButtons();
    this.stateChanges$.next();

    const formValue: TFormValue = this.form.getRawValue();
    this.options
      .saveFn(formValue, {
        loadParams: this.loadParams,
        progressCallback: (percent) => {
          this.progress = percent;
          this.stateChanges$.next();
        },
      })
      .pipe(first())
      .subscribe({
        next: (data) => {
          if (this.options.navigateFn) {
            this.options.navigateFn({
              close: close,
              save: true,
              loadParams: this.loadParams,
              savedData: formValue,
              saveResponse: data,
            });
          }
          this.saving = false;
          this.progress = null;
          this.form.markAsPristine();
          this.form.updateValueAndValidity();
          this.updateButtons();
          this.stateChanges$.next();
        },
        error: (err) => {
          this.saving = false;
          this.progress = null;
          this.exception = {
            errorObject: err,
          };
          this.updateButtons();
          this.stateChanges$.next();
        },
      });
  }

  public close(): void {
    if (this.options.navigateFn) {
      this.options.navigateFn({
        close: true,
        save: false,
      });
    }
  }

  private loadData(params: TTriggerData | null): void {
    this.loadingSub.unsubscribe();
    this.loading = true;
    this.hasLoadError = false;
    this.exception = null;
    this.updateButtons();
    this.stateChanges$.next();

    this.loadingSub = (this.options.loadFn ? this.options.loadFn(params) : of({} as TLoadData)).pipe(first()).subscribe({
      next: () => {
        this.loading = false;
        this.updateButtons();
        this.stateChanges$.next();
      },
      error: (err) => {
        this.loading = false;
        this.hasLoadError = true;
        this.exception = {
          errorObject: err,
          alignCenter: true,
          icon: 'sentiment_very_dissatisfied',
        };
        this.updateButtons();
        this.stateChanges$.next();
      },
    });
  }

  private updateButtons(): void {
    this.buttons = [];
    if (this.contentVisible) {
      if (this.buttonDefs.save) {
        this.buttons.push(this.buttonDefs.save);
      }
      if (this.buttonDefs.saveAndClose) {
        this.buttons.push(this.buttonDefs.saveAndClose);
      }
    }

    if (this.buttonDefs.cancel) {
      this.buttons.push(this.buttonDefs.cancel);
    }
  }
}
