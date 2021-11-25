import { ContentChild, Directive, ElementRef, Input, TemplateRef } from '@angular/core';

@Directive({ selector: '[psTableColumnTemplate]' })
export class PsTableColumnTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({ selector: '[psTableColumnHeaderTemplate]' })
export class PsTableColumnHeaderTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ps-table-column',
})
export class PsTableColumnDirective {
  @Input() public header = '';
  @Input() public property = '';
  @Input() public sortable = true;
  @Input() public mandatory = false;
  @Input() public width = 'auto';
  @Input() public headerStyles: { [key: string]: string } = {};
  @Input() public columnStyles: { [key: string]: string } = {};
  @ContentChild(PsTableColumnTemplateDirective, { read: TemplateRef })
  public columnTemplate: TemplateRef<any> | null = null;
  @ContentChild(PsTableColumnHeaderTemplateDirective, { read: TemplateRef })
  public headerTemplate: TemplateRef<any> | null = null;
}

@Directive({
  selector: '[psTableTopButtonSection]',
})
export class PsTableTopButtonSectionDirective {
  constructor(public el: ElementRef) {}
}

/**
 * @deprecated Please use actions from PsTableDataSource
 */
@Directive({
  selector: '[psTableListActions]',
})
export class PsTableListActionsDirective {
  constructor(public el: ElementRef) {}
}

/**
 * @deprecated Please use actions from PsTableDataSource
 */
@Directive({
  selector: '[psTableRowActions]',
})
export class PsTableRowActionsDirective {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[psTableCustomHeader]',
})
export class PsTableCustomHeaderDirective {
  constructor(public el: ElementRef) {}
}

@Directive({
  selector: '[psTableCustomSettings]',
})
export class PsTableCustomSettingsDirective {
  constructor(public el: ElementRef) {}
}

@Directive({ selector: '[psTableRowDetailTemplate]' })
export class PsTableRowDetailTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ps-table-row-detail',
})
export class PsTableRowDetailDirective {
  /** Gibt an, ob die Row Details initial expanded sein sollen */
  @Input() public expanded = false;
  @Input() public showToggleColumn: boolean | ((row: any) => boolean) = true;

  @ContentChild(PsTableRowDetailTemplateDirective, { read: TemplateRef })
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
