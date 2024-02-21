import { ContentChild, Directive, Input, TemplateRef } from '@angular/core';

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
  selector: 'zv-table-column',
  standalone: true,
})
export class ZvTableColumn {
  @Input() public header = '';
  @Input({ required: true }) public property = '';
  @Input() public sortable = true;
  @Input() public mandatory = false;
  @Input() public width = 'auto';
  @Input() public headerStyles: { [key: string]: string } = {};
  @Input() public columnStyles: { [key: string]: string } = {};
  @ContentChild(ZvTableColumnTemplate, { read: TemplateRef })
  public columnTemplate: TemplateRef<any> | null = null;
  @ContentChild(ZvTableColumnHeaderTemplate, { read: TemplateRef })
  public headerTemplate: TemplateRef<any> | null = null;
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
  selector: 'zv-table-row-detail',
  standalone: true,
})
export class ZvTableRowDetail {
  /** Gibt an, ob die Row Details initial expanded sein sollen */
  @Input() public expanded = false;
  @Input() public showToggleColumn: boolean | ((row: any) => boolean) = true;

  @ContentChild(ZvTableRowDetailTemplate, { read: TemplateRef })
  public template: TemplateRef<any> | null = null;

  private expandedItems = new WeakSet();
  private seenItems = new WeakSet();

  public toggle(item: any, open?: boolean) {
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

  public isExpanded(item: any) {
    // Beim ersten Aufruf für ein Item expanden, wenn expanded === true
    if (this.expanded && !this.seenItems.has(item)) {
      this.expandedItems.add(item);
      this.seenItems.add(item);
    }

    return this.expandedItems.has(item);
  }
}
