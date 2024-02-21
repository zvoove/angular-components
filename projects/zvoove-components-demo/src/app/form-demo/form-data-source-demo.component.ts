import { JsonPipe, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IZvButton, IZvException } from '@zvoove/components/core';
import { IZvFormDataSource, IZvFormDataSourceConnectOptions, IZvSavebarMode, ZvFormModule } from '@zvoove/components/form';
import { BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';

export interface ZvFormDataSourceOptions<TParams, TData> {
  form: FormGroup;
  loadTrigger$: Observable<TParams>;
  loadFn: (params: TParams) => Observable<TData>;
  saveFn: (data: TData, params: TParams) => Observable<void>;
}

class DemoZvFormDataSource<TParams, TData> implements IZvFormDataSource {
  public autocomplete: 'on' | 'off' = 'off';
  public get form(): FormGroup {
    return this.options.form;
  }
  public buttons: IZvButton[] = [];
  public get contentVisible(): boolean {
    return !this._hasLoadError;
  }
  public get contentBlocked(): boolean {
    return this._loading || this._saving || this._blockView;
  }
  public exception: IZvException;
  public get savebarMode(): IZvSavebarMode {
    return this._hasLoadError ? 'hide' : 'auto';
  }

  public progress: number | null = null;

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
    scrollToError: { type: 'icon', icon: 'error_outline', color: 'warn', click: () => this._scrollToError() } as IZvButton,
    edit: {
      label: 'bearbeiten',
      type: 'raised',
      color: 'primary',
      disabled: () => this.contentBlocked,
      click: () => this.edit(),
    } as IZvButton,
    save: {
      label: 'speichern',
      type: 'raised',
      color: 'primary',
      disabled: () => this.contentBlocked || !this.form.valid,
      click: () => this.save(),
    } as IZvButton,
    cancel: { label: 'cancel', type: 'stroked', color: null, disabled: () => false, click: () => this.reset() } as IZvButton,
  };

  private _loadingSub = Subscription.EMPTY;
  private _connectSub = Subscription.EMPTY;
  private _errorInViewSub = Subscription.EMPTY;
  constructor(private options: ZvFormDataSourceOptions<TParams, TData>) {}

  public connect(options: IZvFormDataSourceConnectOptions): Observable<void> {
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
    this.progress = 0;
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
          this.progress = null;
          this.stateChanges$.next();
        },
        error: (err) => {
          this._saving = false;
          this.progress = null;
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
  templateUrl: './form-data-source-demo.component.html',
  styleUrls: ['./form-data-source-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    ZvFormModule,
    MatFormFieldModule,
    NgFor,
    JsonPipe,
  ],
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
  public dataSource = new DemoZvFormDataSource({
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

  public hideProgress() {
    this.dataSource.progress = null;
  }
}
