import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, contentChildren, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { ComponentPageContentDirective } from './component-page-content.directive';

@Component({
  selector: 'app-component-page-wrapper',
  templateUrl: './component-page-wrapper.component.html',
  styleUrls: ['./component-page-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatTabsModule, ComponentPageContentDirective, NgTemplateOutlet],
})
export class AppComponentPageWrapper {
  componentName = input.required<string>();
  pagesQueryList = contentChildren(ComponentPageContentDirective);
  demoContent = computed(() => this.pagesQueryList().find((c) => c.type() === 'demo'));
  apiContent = computed(() => this.pagesQueryList().find((c) => c.type() === 'api'));
  setupContent = computed(() => this.pagesQueryList().find((c) => c.type() === 'setup'));
  otherContents = computed(() => this.pagesQueryList().filter((c) => c.type() === 'other'));

  platform = inject(PLATFORM_ID);
  selectedIndex = isPlatformBrowser(this.platform) ? +window.location.hash.substring(1) : 0;

  onSelectedIndexChange(index: number) {
    this.selectedIndex = index;
    window.location.hash = index + '';
  }
}
