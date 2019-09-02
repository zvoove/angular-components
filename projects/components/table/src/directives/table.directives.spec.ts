import { PsTableRowDetailDirective } from './table.directives';

describe('PsTableRowDetailDirective', () => {
  it('should toggle isExpandable when toggle() is called', () => {
    const directive = new PsTableRowDetailDirective();

    const item = {};

    expect(directive.isExpanded(item)).toBe(false);
    expect(directive.toggle(item));
    expect(directive.isExpanded(item)).toBe(true);
    expect(directive.toggle(item));
    expect(directive.isExpanded(item)).toBe(false);
  });

  it('should set initial expandable status for an item to true if expanded is true', () => {
    const directive = new PsTableRowDetailDirective();
    directive.expanded = true;

    const item = {};

    expect(directive.isExpanded(item)).toBe(true);
    expect(directive.toggle(item));
    expect(directive.isExpanded(item)).toBe(false);
    expect(directive.toggle(item));
    expect(directive.isExpanded(item)).toBe(true);
  });
});
