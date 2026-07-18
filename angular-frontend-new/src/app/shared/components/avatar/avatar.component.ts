import { Component, HostBinding, Input, OnChanges } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const AVATAR_SIZES: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 112,
};

@Component({
  selector: 'app-avatar',
  standalone: true,
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent implements OnChanges {
  @Input() src?: string | null;
  @Input() name?: string | null;
  @Input() alt?: string;
  @Input() size: AvatarSize | number = 'md';
  @Input() bordered = false;

  protected imageFailed = false;

  @HostBinding('style.--app-avatar-size')
  protected get hostSize(): string {
    const size = typeof this.size === 'number' ? Math.max(16, this.size) : AVATAR_SIZES[this.size];
    return `${size}px`;
  }

  protected get showImage(): boolean {
    return Boolean(this.src?.trim()) && !this.imageFailed;
  }

  protected get initials(): string {
    const parts = this.name?.trim().split(/\s+/).filter(Boolean) ?? [];

    if (parts.length === 0) {
      return '?';
    }

    return parts
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  protected get accessibleLabel(): string {
    return this.alt || `${this.name?.trim() || 'User'} avatar`;
  }

  ngOnChanges(): void {
    this.imageFailed = false;
  }

  protected onImageError(): void {
    this.imageFailed = true;
  }
}
