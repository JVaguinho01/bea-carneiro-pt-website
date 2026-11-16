import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ScrollService } from '../../core/services/scroll.service';
import { SERVICE_PHOTOS } from '../../data/content';
import { IconComponent } from '../../shared/icons/icon.component';
import { OverlayComponent } from '../../shared/overlay/overlay.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';
import { SnapCarouselDirective } from '../../shared/snap-carousel/snap-carousel.directive';

export interface Service {
  id: string;
  number: string;
  title: string;
  excerpt: string;
  photoAlt: string;
  panel: {
    label: string;
    title: string;
    lead: string;
    listTitle: string;
    list: string[];
    facts: { title: string; text: string }[];
    cta: string;
    subject: string;
  };
}

@Component({
  selector: 'app-services',
  imports: [TranslatePipe, IconComponent, OverlayComponent, RevealDirective, SnapCarouselDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  private readonly i18n = inject(I18nService);
  protected readonly scroll = inject(ScrollService);
  protected readonly photos = SERVICE_PHOTOS;

  protected readonly items = computed(() => this.i18n.get<Service[]>('services.items'));
  private readonly overlay = viewChild.required(OverlayComponent);
  protected readonly openIndex = signal<number | null>(null);
  protected readonly openItem = computed(() => {
    const i = this.openIndex();
    return i === null ? null : this.items()[i];
  });

  protected open(i: number): void {
    this.openIndex.set(i);
  }

  protected close(): void {
    this.openIndex.set(null);
  }

  protected askAbout(service: Service): void {
    this.overlay().closeNow();
    this.close();
    setTimeout(() => this.scroll.goToContact(service.panel.subject), 60);
  }
}
