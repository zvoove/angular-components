import { ContentChild, Directive, ElementRef, Input, TemplateRef } from '@angular/core';

@Directive({ selector: '[zvTableColumnTemplate]' })
export class ZvTableColumnTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({ selector: '[zvTableColumnHeaderTemplate]' })
export class ZvTableColumnHeaderTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'zv-table-column',
})
export class ZvTableColumnDirective {
  @Input() public header = '';
  @Input() public property = '';
  @Input() public sortable = true;
  @Input() public mandatory = false;
  @Input() public width = 'auto';
  @Input() public headerStyles: { [key: string]: string } = {};
  @Input() public columnStyles: { [key: string]: string } = {};
  @ContentChild(ZvTableColumnTemplateDirective, { read: TemplateRef })
  public columnTemplate: TemplateRef<any> | null = null;
  @ContentChild(ZvTableColumnHeaderTemplateDirective, { read: TemplateRef })
  public headerTemplate: TemplateRef<any> | null = null;
}

@Directive({
  selector: '[zvTableTopButtonSection]',
})
export class ZvTableTopButtonSectionDirective {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[zvTableCustomHeader]',
})
export class ZvTableCustomHeaderDirective {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[zvTableCustomSettings]',
})
export class ZvTableCustomSettingsDirective {
  constructor(public el: ElementRef) {}
}

@Directive({ selector: '[zvTableRowDetailTemplate]' })
export class ZvTableRowDetailTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'zv-table-row-detail',
})
export class ZvTableRowDetailDirective {
  /** Gibt an, ob die Row Details initial expanded sein sollen */
  @Input() public expanded = false;
  @Input() public showToggleColumn: boolean | ((row: any) => boolean) = true;

  @ContentChild(ZvTableRowDetailTemplateDirective, { read: TemplateRef })
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
