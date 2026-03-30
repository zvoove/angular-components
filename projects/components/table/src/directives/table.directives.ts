import { Directive, TemplateRef, contentChild, input } from '@angular/core';

@Directive({
  selector: '[zvTableColumnTemplate]',
  standalone: true,
})
export class ZvTableColumnTemplate {}

@Directive({
  selector: '[zvTableColumnHeaderTemplate]',
  standalone: true,
})
export class ZvTableColumnHeaderTemplate {}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'zv-table-column',
  standalone: true,
})
export class ZvTableColumn {
  public readonly header = input('');
  public readonly property = input.required<string>();
  public readonly sortable = input(true);
  public readonly mandatory = input(false);
  public readonly width = input('auto');
  public readonly headerStyles = input<Record<string, string>>({});
  public readonly columnStyles = input<Record<string, string>>({});
  public readonly columnTemplate = contentChild(ZvTableColumnTemplate, { read: TemplateRef });
  public readonly headerTemplate = contentChild(ZvTableColumnHeaderTemplate, { read: TemplateRef });
}

@Directive({
  selector: '[zvTableTopButtonSection]',
  standalone: true,
})
export class ZvTableTopButtonSectionTemplate {}

@Directive({
  selector: '[zvTableCustomHeader]',
  standalone: true,
})
export class ZvTableCustomHeaderTemplate {}

@Directive({
  selector: '[zvTableCustomSettings]',
  standalone: true,
})
export class ZvTableCustomSettingsTemplate {}

@Directive({
  selector: '[zvTableRowDetailTemplate]',
  standalone: true,
})
export class ZvTableRowDetailTemplate {}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'zv-table-row-detail',
  standalone: true,
})
export class ZvTableRowDetail {
  /** Gibt an, ob die Row Details initial expanded sein sollen */
  public readonly expanded = input(false);
  public readonly showToggleColumn = input<boolean | ((row: object) => boolean)>(true);

  public readonly template = contentChild(ZvTableRowDetailTemplate, { read: TemplateRef });

  private expandedItems = new WeakSet();
  private seenItems = new WeakSet<object>();

  /** @public This is a public api */
  public toggle(item: object, open?: boolean) {
    if (this.expandedItems.has(item)) {
      if (open === true) {
        return;
      }

      this.expandedItems.delete(item);
    } else {
      if (open === false) {
        return;
      }

      this.expandedItems.add(item);
    }
  }

  /** @public This is a public api */
  public isExpanded(item: object) {
    // Beim ersten Aufruf für ein Item expanden, wenn expanded === true
    if (this.expanded() && !this.seenItems.has(item)) {
      this.expandedItems.add(item);
      this.seenItems.add(item);
    }

    return this.expandedItems.has(item);
  }
}
