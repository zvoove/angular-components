import { Pipe, PipeTransform } from '@angular/core';
import { IPsTableAction } from '../models';

/**
 * Filters out hidden actions
 */
@Pipe({
  name: 'psTableActionsToRender',
  pure: true,
})
export class PsTableActionsToRenderPipe implements PipeTransform {
  transform<T>(actions: IPsTableAction<T>[], ...args: [T | T[]]): any {
    const elements = Array.isArray(args[0]) ? args[0] : [args[0]];
    return actions.filter((a) => !a.isHiddenFn || !a.isHiddenFn(elements));
  }
}
