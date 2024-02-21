import { ZvTableRowDetail } from './table.directives';

describe('ZvTableRowDetailDirective', () => {
  let dir: ZvTableRowDetail;
  let item: any;
  beforeEach(() => {
    dir = new ZvTableRowDetail();
    item = {};
  });

  it('should toggle isExpandable when toggle() is called with open = true', () => {
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item, true);
    expect(dir.isExpanded(item)).toBeTruthy();
    dir.toggle(item, true);
    expect(dir.isExpanded(item)).toBeTruthy();
  });

  it('should toggle isExpandable when toggle() is called with open = false', () => {
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item, false);
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item, false);
    expect(dir.isExpanded(item)).toBeFalsy();
  });

  it('should toggle isExpandable when toggle() is called with open = null|undefined', () => {
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeTruthy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeFalsy();
  });

  it('should set initial expandable status for an item to true if expanded is true', () => {
    dir.expanded = true;

    expect(dir.isExpanded(item)).toBeTruthy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeFalsy();
    dir.toggle(item);
    expect(dir.isExpanded(item)).toBeTruthy();
  });
});
