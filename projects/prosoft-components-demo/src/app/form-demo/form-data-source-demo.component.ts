import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { IPsButton, IPsException } from '@prosoft/components/core';
import { IPsFormDataSource, IPsFormDataSourceConnectOptions } from '@prosoft/components/form';
import { IPsSavebarMode } from '@prosoft/components/savebar';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';

export interface PsFormDataSourceOptions<TParams, TData> {
  form: FormGroup;
  loadTrigger$: Observable<TParams>;
  loadFn: (params: TParams) => Observable<TData>;
  saveFn: (data: TData, params: TParams) => Observable<void>;
}

class DemoPsFormDataSource<TParams, TData> implements IPsFormDataSource {
  public autocomplete: 'off' = 'off';
  public get form(): FormGroup {
    return this.options.form;
  }
  public buttons: IPsButton[] = [];
  public get contentVisible(): boolean {
    return !this._hasLoadError;
  }
  public get contentBlocked(): boolean {
    return this._loading || this._saving || this._blockView;
  }
  public exception: IPsException;
  public get savebarMode(): IPsSavebarMode {
    return this._hasLoadError ? 'hide' : 'auto';
  }

  private _originalData: TData = null;
  private _loading = false;
  private _hasLoadError = false;
  private _saving = false;
  private _blockView = false;
  private _isEditMode = false;
  private _errorInView = false;
  private stateChanges$ = new Subject<void>();
  private _loadParams: TParams = null;
  public _scrollToError: () => void;

  private buttonDefs = {
    scrollToError: { type: 'icon', icon: 'error_outline', color: 'warn', click: () => this._scrollToError() } as IPsButton,
    edit: {
      label: 'bearbeiten',
      type: 'raised',
      color: 'primary',
      disabled: () => this.contentBlocked,
      click: () => this.edit(),
    } as IPsButton,
    save: {
      label: 'speichern',
      type: 'raised',
      color: 'primary',
      disabled: () => this.contentBlocked || !this.form.valid,
      click: () => this.save(),
    } as IPsButton,
    cancel: { label: 'cancel', type: 'stroked', color: null, disabled: () => false, click: () => this.reset() } as IPsButton,
  };

  private _loadingSub = Subscription.EMPTY;
  private _connectSub = Subscription.EMPTY;
  private _errorInViewSub = Subscription.EMPTY;
  constructor(private options: PsFormDataSourceOptions<TParams, TData>) {}

  public connect(options: IPsFormDataSourceConnectOptions): Observable<void> {
    this._scrollToError = () => setTimeout(() => options.scrollToError(), 0); // Warten bis der error gerendert ist
    this._errorInViewSub = options.errorInView$.subscribe((value) => {
      this._errorInView = value;
      this.updateButtons();
      this.stateChanges$.next();
    });

    this._connectSub = this.options.loadTrigger$.subscribe((params) => {
      this._loadParams = params;
      this.loadData(params);
    });
    return this.stateChanges$;
  }

  public disconnect(): void {
    this._connectSub.unsubscribe();
    this._errorInViewSub.unsubscribe();
    this._loadingSub.unsubscribe();
  }

  public setViewBlocked(value: boolean) {
    this._blockView = value;
    this.stateChanges$.next();
  }

  public edit(): void {
    this.setEditMode(true);
  }

  public save(): void {
    this._saving = true;
    this.exception = null;
    this.stateChanges$.next();

    const formValue: TData = this.form.getRawValue();
    this.options
      .saveFn(formValue, this._loadParams)
      .pipe(take(1))
      .subscribe({
        next: (_data) => {
          this.markDataSaved();
          this.setEditMode(false);
          this._saving = false;
          this.stateChanges$.next();
        },
        error: (err) => {
          this._saving = false;
          this.exception = {
            errorObject: err,
          };

          if (!this._errorInView) {
            this._scrollToError();
          }

          this.updateButtons();
          this.stateChanges$.next();
        },
      });
  }

  public reset(): void {
    this.resetData();
    this.setEditMode(false);
    this.stateChanges$.next();
  }

  private loadData(params: TParams) {
    this._loadingSub.unsubscribe();
    this._loading = true;
    this._hasLoadError = false;
    this.exception = null;
    this.initializeData(null);
    this.setEditMode(false);
    this.stateChanges$.next();

    this._loadingSub = this.options
      .loadFn(params)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.initializeData(data);
          this._loading = false;
          this.stateChanges$.next();
        },
        error: (err) => {
          this._loading = false;
          this._hasLoadError = true;
          this.exception = {
            errorObject: err,
            alignCenter: true,
            icon: 'sentiment_very_dissatisfied',
          };
          this.stateChanges$.next();
        },
      });
  }

  private initializeData(data: TData) {
    if (data == null) {
      this.form.reset();
    } else {
      this.form.patchValue(data);
    }
    this.markDataSaved();
  }

  private markDataSaved() {
    this._originalData = this.form.getRawValue();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private resetData() {
    this.form.patchValue(this._originalData);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private setEditMode(value: boolean) {
    this._isEditMode = value;
    if (value) {
      this.form.enable();
    } else {
      this.form.disable();
    }
    this.updateButtons();
  }

  private updateButtons() {
    this.buttons = [];
    if (this.contentVisible) {
      if (!this._isEditMode) {
        this.buttons.push(this.buttonDefs.edit);
      } else {
        if (this.exception && !this._errorInView) {
          this.buttons.push(this.buttonDefs.scrollToError);
        }
        this.buttons.push(this.buttonDefs.save);
        this.buttons.push(this.buttonDefs.cancel);
      }
    }
  }
}

@Component({
  selector: 'app-form-data-source-demo',
  template: `
    <mat-card class="app-form-data-source-demo__settings">
      <mat-checkbox [(ngModel)]="loadError">load error</mat-checkbox>
      <mat-checkbox [(ngModel)]="saveError">save error</mat-checkbox>
      <button mat-flat-button type="button" color="accent" (click)="reload()">reload</button>
    </mat-card>
    <div class="app-form-data-source-demo__grid">
      <ps-form [dataSource]="dataSource">
        <mat-card>
          <form [formGroup]="form">
            <mat-form-field>
              <mat-label>Input 1</mat-label>
              <input type="text" matInput formControlName="input1" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Input 2</mat-label>
              <input type="text" matInput formControlName="input2" />
            </mat-form-field>
          </form>
        </mat-card>
        <mat-card style="height: 500px; margin-top: 1em;">dummy card</mat-card>
        <ng-container psFormSavebarButtons>
          <button mat-stroked-button type="button">dummy button 1</button>
          <button mat-stroked-button type="button">dummy button 2</button>
        </ng-container>
      </ps-form>
      <mat-card class="app-form-data-source-demo__logs">
        <div *ngFor="let log of logs" class="app-form-data-source-demo__log-item">{{ log | json }}</div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .app-form-data-source-demo__settings {
        margin-bottom: 1em;
      }

      .app-form-data-source-demo__settings mat-checkbox {
        margin: 1em;
      }

      .app-form-data-source-demo__grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1em;
      }

      .app-form-data-source-demo__log-item {
        margin-bottom: 0.25em;
        padding-bottom: 0.25em;
        border-bottom: 1px solid #ccc;
        font-size: 0.95em;
      }

      app-form-demo .mat-form-field {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FormDataSourceDemoComponent {
  public loadError = false;
  public saveError = false;

  public form = new FormGroup(
    {
      input1: new FormControl('a'),
      input2: new FormControl('b'),
    },
    [
      (formGroup: AbstractControl) =>
        formGroup.value.input1 === formGroup.value.input2 ? null : { equal: 'input1 and input2 must be equal' },
    ]
  );
  public counter = 0;
  public loadTrigger$ = new BehaviorSubject(this.counter);
  public logs: any[] = [];
  public dataSource = new DemoPsFormDataSource({
    form: this.form,
    loadTrigger$: this.loadTrigger$, // could be route params in a real application
    loadFn: (count) => {
      this.logs.push({ type: 'load', params: count });
      return of({
        input1: 'input 1 load count ' + count,
        input2: 'input 2 load count ' + count,
      }).pipe(
        delay(1000),
        map((x) => {
          if (this.loadError) {
            throw new Error('this is the server error (loading)');
          }

          return x;
        })
      );
    },
    saveFn: (data, count) => {
      this.logs.push({ type: 'save', data: data, params: count });
      return of(null).pipe(
        delay(1000),
        tap((x) => {
          if (this.saveError) {
            throw new Error('this is the server error (saving)');
          }

          return x;
        })
      );
    },
  });

  public reload() {
    this.loadTrigger$.next(++this.counter);
  }
}
