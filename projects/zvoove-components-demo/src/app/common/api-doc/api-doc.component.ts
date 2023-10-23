import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList, TrackByFunction, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { AppApiDocInputComponent } from '../api-doc-input/api-doc-input.component';
import { AppApiDocOutputComponent } from '../api-doc-output/api-doc-output.component';

@Component({
  selector: 'app-api-doc',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './api-doc.component.html',
  styleUrls: ['./api-doc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppApiDocComponent {
  @Input({ required: true }) name: string;
  @ContentChildren(AppApiDocInputComponent) set inputsList(items: QueryList<AppApiDocInputComponent>) {
    this.inputs = items.toArray();
    items.changes.pipe(takeUntilDestroyed()).subscribe(() => {
      this.inputs = items.toArray();
    });
  }
  @ContentChildren(AppApiDocOutputComponent) set outputsList(items: QueryList<AppApiDocOutputComponent>) {
    this.outputs = items.toArray();
    items.changes.pipe(takeUntilDestroyed()).subscribe(() => {
      this.outputs = items.toArray();
    });
  }

  inputs: AppApiDocInputComponent[] = [];
  outputs: AppApiDocOutputComponent[] = [];

  trackByInput: TrackByFunction<AppApiDocInputComponent> = (_idx, item) => item.name;
  trackByOutput: TrackByFunction<AppApiDocOutputComponent> = (_idx, item) => item.name;
}
