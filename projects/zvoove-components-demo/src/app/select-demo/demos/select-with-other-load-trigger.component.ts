import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { DefaultZvSelectDataSource, ZvSelectDataSource, ZvSelectLoadTrigger } from '@zvoove/components/select';
import { ZvSelectModule } from '@zvoove/components/select/src/select.module';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-select-with-other-load-trigger',
  templateUrl: './select-with-other-load-trigger.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatRadioModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, ZvSelectModule, JsonPipe],
})
export class SelectWithOtherLoadTriggerComponent {
  public dataSource: ZvSelectDataSource;
  public currentLoadTrigger = 'initial';
  public loadCount = 0;
  public form = new FormGroup({
    select: new FormControl('idx'),
  });

  constructor(private cd: ChangeDetectorRef) {
    this.onTriggerChanged(this.currentLoadTrigger);
  }

  public onTriggerChanged(value: string) {
    this.loadCount = 0;
    if (value === 'initial') {
      this.dataSource = this.createDataSource(ZvSelectLoadTrigger.initial);
    } else if (value === 'firstopen') {
      this.dataSource = this.createDataSource(ZvSelectLoadTrigger.firstPanelOpen);
    } else {
      this.dataSource = this.createDataSource(ZvSelectLoadTrigger.everyPanelOpen);
    }
    this.cd.markForCheck();
  }

  private createDataSource(loadTrigger: ZvSelectLoadTrigger) {
    return new DefaultZvSelectDataSource<number>({
      mode: 'id',
      idKey: 'value',
      labelKey: 'label',
      items: () => {
        this.loadCount++;
        const rnd1 = Math.random();
        const rnd2 = Math.random();
        return of([
          {
            value: rnd1,
            label: 'item ' + rnd1,
          },
          {
            value: rnd2,
            label: 'item ' + rnd2,
          },
        ]).pipe(delay(1000));
      },
      loadTrigger: loadTrigger,
    });
  }
}
