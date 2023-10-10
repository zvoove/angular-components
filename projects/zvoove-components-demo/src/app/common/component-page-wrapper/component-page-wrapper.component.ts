import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChildren, Input, OnDestroy, QueryList, TrackByFunction } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { Subscription, startWith } from 'rxjs';
import { ComponentPageContentDirective } from './component-page-content.directive';

@Component({
  selector: 'app-component-page-wrapper',
  templateUrl: './component-page-wrapper.component.html',
  styleUrls: ['./component-page-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, NgFor, MatCardModule, MatTabsModule, ComponentPageContentDirective, NgTemplateOutlet],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AppComponentPageWrapper implements OnDestroy {
  @Input({ required: true }) componentName: string;
  @ContentChildren(ComponentPageContentDirective) set pagesQueryList(list: QueryList<ComponentPageContentDirective>) {
    this._pagesQueryListSub.unsubscribe();
    this._pagesQueryListSub = list.changes.pipe(startWith(list)).subscribe((newList) => {
      const contents: ComponentPageContentDirective[] = newList.toArray();
      this.demoContent = contents.find((c) => c.type === 'demo');
      this.apiContent = contents.find((c) => c.type === 'api');
      this.setupContent = contents.find((c) => c.type === 'setup');
      this.otherContents = contents.filter((c) => c.type === 'other');
    });
  }
  _pagesQueryListSub = Subscription.EMPTY;
  demoContent: ComponentPageContentDirective;
  apiContent: ComponentPageContentDirective;
  setupContent: ComponentPageContentDirective;
  otherContents: ComponentPageContentDirective[] = [];

  selectedIndex = +window.location.hash.substring(1);

  onSelectedIndexChange(index: number) {
    this.selectedIndex = index;
    window.location.hash = index + '';
  }

  trackContent: TrackByFunction<ComponentPageContentDirective> = (_idx: number, item: ComponentPageContentDirective) => {
    return item;
  };

  ngOnDestroy() {
    this._pagesQueryListSub.unsubscribe();
  }
}
