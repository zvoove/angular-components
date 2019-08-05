import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { IPsFormSaveParams } from '@prosoft/components/form';
import { PsFormEvent, PsFormComponent } from '@prosoft/components/form';
import { of, Subscription } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';
import { DemoPsFormActionService } from './form-demo.module';

@Component({
  selector: 'app-form-demo',
  template: `
    <mat-card class="app-form-demo__settings">
      <mat-checkbox [(ngModel)]="hideSave">hide save</mat-checkbox>
      <mat-checkbox [(ngModel)]="hideSaveAndClose">hide save & close</mat-checkbox>
      <mat-checkbox [(ngModel)]="canSave">can save</mat-checkbox>
      <mat-checkbox [(ngModel)]="preventDefault">prevent service events</mat-checkbox>
      <mat-checkbox [(ngModel)]="loadError">load error</mat-checkbox>
      <mat-checkbox [(ngModel)]="saveError">save error</mat-checkbox>
      <button mat-flat-button type="button" color="accent" (click)="reload()">reload</button>
    </mat-card>
    <div class="app-form-demo__grid">
      <ps-form
        [form]="form"
        [formMode]="formMode"
        [loadFnc]="loadFnc"
        [saveFnc]="saveFnc"
        [hideSave]="hideSave"
        [hideSaveAndClose]="hideSaveAndClose"
        [canSave]="canSave"
        (loadSuccess)="onEvent($event, 'loadSuccess')"
        (loadError)="onEvent($event, 'loadError')"
        (saveSuccess)="onEvent($event, 'saveSuccess')"
        (saveError)="onEvent($event, 'saveError')"
        (cancel)="onEvent($event, 'cancel')"
      >
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
      </ps-form>
      <mat-card class="app-form-demo__logs">
        <div *ngFor="let log of logs" class="app-form-demo__log-item">{{ log }}</div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .app-form-demo__settings {
        margin-bottom: 1em;
      }

      .app-form-demo__settings mat-checkbox {
        margin: 1em;
      }

      .app-form-demo__grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-gap: 1em;
      }

      .app-form-demo__log-item {
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
export class FormDemoComponent implements OnDestroy {
  public preventDefault = false;
  public canSave = true;
  public hideSave = false;
  public hideSaveAndClose = false;
  public saveError = false;
  public loadError = false;
  public formMode = 'create';
  public form = new FormGroup(
    {
      input1: new FormControl('a'),
      input2: new FormControl('b'),
    },
    [
      (formGroup: AbstractControl) => {
        return formGroup.value.input1 === formGroup.value.input2 ? null : { equal: 'input1 and input2 must be equal' };
      },
    ]
  );

  public logs: string[] = [];
  public serviceLogsSubscription: Subscription;

  @ViewChild(PsFormComponent, { static: true }) formCmp: PsFormComponent;

  constructor(private cd: ChangeDetectorRef) {
    this.serviceLogsSubscription = DemoPsFormActionService.logStream$.subscribe(log => {
      this.logs.push(log);
      this.cd.markForCheck();
    });
  }

  public ngOnDestroy() {
    this.serviceLogsSubscription.unsubscribe();
  }

  public loadFnc = () => {
    this.logs.push(`load`);
    return of({ input1: 'a', input2: 'b' }).pipe(
      delay(1000),
      map(x => {
        if (this.loadError) {
          throw new Error('this is the server error (loading)');
        }

        return x;
      })
    );
  };

  public saveFnc = (value: any, params: IPsFormSaveParams) => {
    this.logs.push(`save (value: ${JSON.stringify(value)}, close: ${params.close})`);
    return of({ input1: 'a', input2: 'b' }).pipe(
      delay(1000),
      tap(x => {
        if (this.saveError) {
          throw new Error('this is the server error (saving)');
        }

        return x;
      })
    );
  };

  public onEvent(event: PsFormEvent, eventName: string) {
    if (this.preventDefault) {
      event.preventDefault();
    }
    this.logs.push(`${eventName} event: ${JSON.stringify(event)}`);
  }

  public reload() {
    this.formCmp.loadData();
  }
}
