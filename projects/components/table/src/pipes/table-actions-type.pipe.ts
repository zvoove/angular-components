import { Pipe, PipeTransform } from '@angular/core';
import { IZvTableAction } from '../models';

/**
 * Filters out hidden actions
 */
@Pipe({
  name: 'zvTableActionType',
  pure: true,
  standalone: true,
})
export class ZvTableActionTypePipe implements PipeTransform {
  public transform<T>(action: IZvTableAction<T>): string {
    if (action.routerLink) {
      return 'link';
    }

    if (action.children) {
      return 'menu';
    }

    return 'button';
  }
}
