import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ZvAvatar } from './avatar.component';

@Component({
  selector: 'zv-test-component',
  template: `
    <zv-avatar [type]="type" [size]="size" [variant]="variant" [name]="name" [image]="image" [initialsAmount]="initialsAmount" />
  `,
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ZvAvatar],
})
class TestComponent {
  type: 'initials' | 'avatar' | 'image' = 'avatar';
  size: 'small' | 'medium' | 'large' = 'medium';
  variant: 'round' | 'square' = 'round';
  name = '';
  image = '';
  initialsAmount: 1 | 2 = 1;
}

describe('ZvAvatar', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function avatarEl(): HTMLElement {
    return fixture.debugElement.query(By.directive(ZvAvatar)).nativeElement;
  }

  describe('default rendering', () => {
    it('should render a person icon by default', () => {
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('person');
    });

    it('should have default host classes', () => {
      const el = avatarEl();
      expect(el.classList).toContain('zv-avatar');
      expect(el.classList).toContain('zv-avatar--medium');
      expect(el.classList).toContain('zv-avatar--round');
      expect(el.classList).toContain('zv-avatar--type-avatar');
    });

    it('should set role="img" on host', () => {
      expect(avatarEl().getAttribute('role')).toBe('img');
    });

    it('should set aria-label to "Avatar" when no name is provided', () => {
      expect(avatarEl().getAttribute('aria-label')).toBe('Avatar');
    });
  });

  describe('type: avatar', () => {
    it('should render a mat-icon with "person"', () => {
      component.type = 'avatar';
      fixture.detectChanges();
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon.nativeElement.textContent.trim()).toBe('person');
    });
  });

  describe('type: initials', () => {
    it('should display a single initial from a one-word name', () => {
      component.type = 'initials';
      component.name = 'Alice';
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span.nativeElement.textContent.trim()).toBe('A');
    });

    it('should display a single initial from a multi-word name with initialsAmount 1', () => {
      component.type = 'initials';
      component.name = 'John Doe';
      component.initialsAmount = 1;
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span.nativeElement.textContent.trim()).toBe('J');
    });

    it('should display two initials from a multi-word name with initialsAmount 2', () => {
      component.type = 'initials';
      component.name = 'John Doe';
      component.initialsAmount = 2;
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span.nativeElement.textContent.trim()).toBe('JD');
    });

    it('should use first and last word for 3+ word names with initialsAmount 2', () => {
      component.type = 'initials';
      component.name = 'John Michael Doe';
      component.initialsAmount = 2;
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span.nativeElement.textContent.trim()).toBe('JD');
    });

    it('should return 1 initial for single-word name even with initialsAmount 2', () => {
      component.type = 'initials';
      component.name = 'Madonna';
      component.initialsAmount = 2;
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span.nativeElement.textContent.trim()).toBe('M');
    });

    it('should fall back to person icon when name is empty', () => {
      component.type = 'initials';
      component.name = '';
      fixture.detectChanges();
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('person');
      expect(avatarEl().classList).toContain('zv-avatar--type-avatar');
    });

    it('should fall back to person icon when name is whitespace only', () => {
      component.type = 'initials';
      component.name = '   ';
      fixture.detectChanges();
      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('person');
    });

    it('should set type class to initials', () => {
      component.type = 'initials';
      component.name = 'Alice';
      fixture.detectChanges();
      expect(avatarEl().classList).toContain('zv-avatar--type-initials');
    });
  });

  describe('type: image', () => {
    it('should render an img element with the provided URL', () => {
      component.type = 'image';
      component.image = 'https://example.com/photo.jpg';
      component.name = 'Test';
      fixture.detectChanges();
      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.getAttribute('src')).toBe('https://example.com/photo.jpg');
    });

    it('should set alt text to name', () => {
      component.type = 'image';
      component.image = 'https://example.com/photo.jpg';
      component.name = 'John Doe';
      fixture.detectChanges();
      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      expect(img.nativeElement.getAttribute('alt')).toBe('John Doe');
    });

    it('should set alt to empty string when no name', () => {
      component.type = 'image';
      component.image = 'https://example.com/photo.jpg';
      component.name = '';
      fixture.detectChanges();
      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      expect(img.nativeElement.getAttribute('alt')).toBe('');
    });

    it('should fall back to initials on image error when name is set', () => {
      component.type = 'image';
      component.image = 'https://example.com/bad.jpg';
      component.name = 'Alice';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      img.nativeElement.dispatchEvent(new Event('error'));
      fixture.detectChanges();

      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span).toBeTruthy();
      expect(span.nativeElement.textContent.trim()).toBe('A');
      expect(avatarEl().classList).toContain('zv-avatar--type-initials');
    });

    it('should fall back to person icon on image error when no name', () => {
      component.type = 'image';
      component.image = 'https://example.com/bad.jpg';
      component.name = '';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      img.nativeElement.dispatchEvent(new Event('error'));
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('person');
      expect(avatarEl().classList).toContain('zv-avatar--type-avatar');
    });

    it('should show fallback immediately when image URL is empty', () => {
      component.type = 'image';
      component.image = '';
      component.name = 'Alice';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      expect(img).toBeFalsy();
      const span = fixture.debugElement.query(By.css('.zv-avatar__initials'));
      expect(span).toBeTruthy();
      expect(span.nativeElement.textContent.trim()).toBe('A');
    });

    it('should show person icon when image URL and name are both empty', () => {
      component.type = 'image';
      component.image = '';
      component.name = '';
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent.trim()).toBe('person');
    });

    it('should reset error state when image URL changes', () => {
      component.type = 'image';
      component.image = 'https://example.com/bad.jpg';
      component.name = 'Alice';
      fixture.detectChanges();

      // Trigger error
      const img = fixture.debugElement.query(By.css('.zv-avatar__image'));
      img.nativeElement.dispatchEvent(new Event('error'));
      fixture.detectChanges();

      // Should be showing initials fallback
      expect(fixture.debugElement.query(By.css('.zv-avatar__initials'))).toBeTruthy();

      // Change image URL
      component.image = 'https://example.com/good.jpg';
      fixture.detectChanges();

      // Should be showing image again (error reset)
      const newImg = fixture.debugElement.query(By.css('.zv-avatar__image'));
      expect(newImg).toBeTruthy();
      expect(newImg.nativeElement.getAttribute('src')).toBe('https://example.com/good.jpg');
    });
  });

  describe('sizes', () => {
    it('should apply small size class', () => {
      component.size = 'small';
      fixture.detectChanges();
      expect(avatarEl().classList).toContain('zv-avatar--small');
    });

    it('should apply medium size class', () => {
      component.size = 'medium';
      fixture.detectChanges();
      expect(avatarEl().classList).toContain('zv-avatar--medium');
    });

    it('should apply large size class', () => {
      component.size = 'large';
      fixture.detectChanges();
      expect(avatarEl().classList).toContain('zv-avatar--large');
    });
  });

  describe('variants', () => {
    it('should apply round variant class', () => {
      component.variant = 'round';
      fixture.detectChanges();
      expect(avatarEl().classList).toContain('zv-avatar--round');
    });

    it('should apply square variant class', () => {
      component.variant = 'square';
      fixture.detectChanges();
      expect(avatarEl().classList).toContain('zv-avatar--square');
    });
  });

  describe('accessibility', () => {
    it('should use name as aria-label when provided', () => {
      component.name = 'John Doe';
      fixture.detectChanges();
      expect(avatarEl().getAttribute('aria-label')).toBe('John Doe');
    });

    it('should fall back to "Avatar" when name is empty', () => {
      component.name = '';
      fixture.detectChanges();
      expect(avatarEl().getAttribute('aria-label')).toBe('Avatar');
    });
  });
});
