import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DefaultZvSelectDataSource, ZvSelectDataSource, ZvSelectLoadTrigger } from '@zvoove/components/select';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-select-with-other-load-trigger',
  template: `
    <h2>Custom load trigger with 1 second loading delay</h2>
    <div>
      <mat-radio-group [(ngModel)]="currentLoadTrigger" (change)="onTriggerChanged($event.value)">
        <mat-radio-button value="initial">initial</mat-radio-button>
        <mat-radio-button value="firstopen">first panel open</mat-radio-button>
        <mat-radio-button value="everyopen">every panel open</mat-radio-button>
      </mat-radio-group>
    </div>
    <span [formGroup]="form">
      <mat-form-field style="display:inline-block">
        <mat-label>select</mat-label>
        <zv-select formControlName="select" [dataSource]="dataSource"></zv-select>
      </mat-form-field>
    </span>
    value: {{ form.value.select | json }}<br />
    current load trigger: {{ currentLoadTrigger }}<br />
    load trigger count: {{ loadCount }}
    <ul>
      <li>Initially '??? (ID: idx)' should be selected and load trigger should be 'initial' with count 1</li>
      <li>For load trigger 'first panel open' count should be 0, increase to 1 on first open. It should never go beyond 1</li>
      <li>For load trigger 'every panel open' count should be 0 and increase by 1 on every open</li>
      <li>When switching the load trigger, the selected value shouldn't vanish</li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
