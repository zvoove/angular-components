import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'zv-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [MatIconModule],
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': '"img"',
    '[attr.aria-label]': 'name() || "Avatar"',
  },
})
export class ZvAvatar {
  public readonly size = input<'small' | 'medium' | 'large'>('medium');
  public readonly type = input<'initials' | 'avatar' | 'image'>('avatar');
  public readonly name = input<string>('');
  public readonly image = input<string>('');
  public readonly initialsAmount = input<1 | 2>(1);
  public readonly variant = input<'round' | 'square'>('round');

  public readonly imageError = linkedSignal(() => {
    this.image();
    return false;
  });

  public readonly displayType = computed(() => {
    const type = this.type();
    if (type === 'initials' && !this.name()?.trim()) {
      return 'avatar';
    }
    if (type === 'image' && (!this.image() || this.imageError())) {
      return this.name()?.trim() ? 'initials' : 'avatar';
    }
    return type;
  });

  public readonly initials = computed(() => {
    const name = this.name()?.trim();
    if (!name) return '';
    const words = name.split(/\s+/);
    if (this.initialsAmount() === 2 && words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return words[0][0].toUpperCase();
  });

  public readonly hostClasses = computed(() => {
    const classes = ['zv-avatar', `zv-avatar--${this.size()}`, `zv-avatar--${this.variant()}`];
    classes.push(`zv-avatar--type-${this.displayType()}`);
    return classes.join(' ');
  });
}
