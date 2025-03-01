import { Pipe, PipeTransform } from '@angular/core';
import { IZvTableAction } from '../models';

/**
 * Filters out hidden actions
 */
@Pipe({
  name: 'zvTableActionsToRender',
  pure: true,
  standalone: true,
})
export class ZvTableActionsToRenderPipe implements PipeTransform {
  transform<T>(actions: IZvTableAction<T>[], ...args: [T | T[]]): IZvTableAction<T>[] {
    const elements = Array.isArray(args[0]) ? args[0] : [args[0]];
    return actions?.filter((a) => !a.isHiddenFn || !a.isHiddenFn(elements));
  }
}
