import { Pipe, PipeTransform } from '@angular/core';
import { IPsTableAction } from '../models';

/**
 * Filters out hidden actions
 */
@Pipe({
  name: 'psTableActionType',
  pure: true,
})
export class PsTableActionTypePipe implements PipeTransform {
  public transform<T>(action: IPsTableAction<T>): string {
    if (action.routerLink) {
      return 'link';
    }

    if (action.children) {
      return 'menu';
    }

    return 'button';
  }
}
