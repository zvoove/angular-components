import { ThemePalette } from '@angular/material/core';

export interface IPsButton {
  label?: string;
  type: 'raised' | 'stroked' | 'icon' | 'flat' | 'default';
  color?: ThemePalette | null;
  icon?: string;
  disabled?: () => boolean;
  click: () => void;
}
