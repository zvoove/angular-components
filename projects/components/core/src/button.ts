import { ThemePalette } from '@angular/material/core';

export type ZvButtonTypes = 'raised' | 'stroked' | 'icon' | 'flat' | 'default';
export type ZvButtonColors = ThemePalette | 'secondary' | 'tertiary' | 'error';

export interface IZvButton {
  label?: string;
  type: ZvButtonTypes;
  color?: ZvButtonColors | null;
  icon?: string;
  disabled?: () => boolean;
  dataCy?: string;
  click: () => void;
}
