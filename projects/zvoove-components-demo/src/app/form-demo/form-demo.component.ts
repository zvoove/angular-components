import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ZvForm } from '@zvoove/components/form';
import { ZvFormService } from '@zvoove/components/form-base';
import { BehaviorSubject, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { DemoZvFormsService } from '../common/demo-zv-form-service';
import { FormDataSource } from './form-data-source';

@Component({
  selector: 'app-form-demo',
  templateUrl: './form-demo.component.html',
  styleUrls: ['./form-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatCardModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    ZvForm,
    MatFormFieldModule,
    JsonPipe,
  ],
  providers: [{ provide: ZvFormService, useClass: DemoZvFormsService }],
})
export class FormDemoComponent {
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
  public dataSource = new FormDataSource({
    form: this.form,
    loadTrigger$: this.loadTrigger$, // could be route params in a real application
    loadFn: (count) => {
      this.logs.push({ type: 'load', params: count });
      return of({
        input1: 'load count ' + count,
        input2: 'load count ' + count,
      }).pipe(
        delay(1000),
        map((dto) => {
          if (this.loadError) {
            throw new Error('this is the server error (loading)');
          }

          this.form.patchValue(dto);

          return dto;
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
