import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { IconComponent } from '../../shared/icons/icon.component';
import { OverlayComponent } from '../../shared/overlay/overlay.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';
import { SnapCarouselDirective } from '../../shared/snap-carousel/snap-carousel.directive';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  excerpt: string;
  full: string[];
}

@Component({
  selector: 'app-testimonials',
  imports: [TranslatePipe, IconComponent, OverlayComponent, RevealDirective, SnapCarouselDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
  private readonly i18n = inject(I18nService);
  protected readonly items = computed(() => this.i18n.get<Testimonial[]>('testimonials.items'));
  protected readonly openIndex = signal<number | null>(null);
  protected readonly openItem = computed(() => {
    const i = this.openIndex();
    return i === null ? null : this.items()[i];
  });

  protected initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .slice(0, 2)
      .join('');
  }
}
