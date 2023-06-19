import { ThemePalette } from '@angular/material/core';

export interface IZvButton {
  label?: string;
  type: 'raised' | 'stroked' | 'icon' | 'flat' | 'default';
  color?: ThemePalette | null;
  icon?: string;
  disabled?: () => boolean;
  dataCy?: string;
  click: () => void;
}
