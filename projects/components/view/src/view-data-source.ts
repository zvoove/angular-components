import { Signal } from '@angular/core';
import { IZvException } from '@zvoove/components/core';

export interface IZvViewDataSource {
  readonly contentVisible: Signal<boolean>;
  readonly contentBlocked: Signal<boolean>;
  readonly exception: Signal<IZvException | null>;
  connect(): void;
  disconnect(): void;
}
