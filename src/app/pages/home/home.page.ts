import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { AboutComponent } from '../../sections/about/about.component';
import { AchievementsComponent } from '../../sections/achievements/achievements.component';
import { ContactComponent } from '../../sections/contact/contact.component';
import { FooterComponent } from '../../sections/footer/footer.component';
import { GalleryComponent } from '../../sections/gallery/gallery.component';
import { HeaderComponent } from '../../sections/header/header.component';
import { HeroComponent } from '../../sections/hero/hero.component';
import { InstagramComponent } from '../../sections/instagram/instagram.component';
import { ServicesComponent } from '../../sections/services/services.component';
import { TestimonialsComponent } from '../../sections/testimonials/testimonials.component';
import { BackToTopComponent } from '../../shared/back-to-top/back-to-top.component';
import { ConsentCardComponent } from '../../shared/consent-card/consent-card.component';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-home-page',
  imports: [
    TranslatePipe,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    AchievementsComponent,
    ServicesComponent,
    GalleryComponent,
    TestimonialsComponent,
    InstagramComponent,
    ContactComponent,
    FooterComponent,
    BackToTopComponent,
    ConsentCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#conteudo">{{ 'common.skipToContent' | t }}</a>
    <app-header />
    <main id="conteudo" tabindex="-1">
      <app-hero />
      <app-about />
      <app-achievements />
      <app-services />
      <app-gallery />
      <app-testimonials />
      <app-instagram />
      <app-contact />
    </main>
    <app-footer />
    <app-back-to-top />
    <app-consent-card />
  `,
  styles: `
    main:focus {
      outline: none;
    }
    .skip-link {
      position: fixed;
      top: 8px;
      left: 8px;
      z-index: 200;
      padding: 12px 16px;
      background: var(--brand-primary);
      color: var(--text-on-brand);
      border-radius: var(--radius-md);
      transform: translateY(-200%);
      transition: transform 150ms ease;
    }
    .skip-link:focus {
      transform: none;
    }
  `,
})
export class HomePage {
  private readonly i18n = inject(I18nService);

  constructor() {
    effect(() => {
      this.i18n.lang();
      this.i18n.applyToDocument();
    });
  }
}
