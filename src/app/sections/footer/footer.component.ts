import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { SITE } from '../../core/config/site.config';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MotionService } from '../../core/services/motion.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { SocialLinksComponent } from '../../shared/social-links/social-links.component';

@Component({
  selector: 'app-footer',
  imports: [TranslatePipe, SocialLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container stack">
        <p class="t-h2 statement">{{ 'footer.statement' | t }}</p>
        <p #wordmark class="wordmark" aria-hidden="true">{{ 'footer.wordmark' | t }}</p>
        <div class="base">
          <div class="credits">
            <p>{{ 'footer.copyright' | t: { year: year } }}</p>
            <p>
              {{ 'footer.credit' | t }}
              <a [href]="authorUrl" target="_blank" rel="noopener noreferrer">{{ 'footer.creditName' | t }}</a>
            </p>
            <p>
              <button type="button" class="link" (click)="prefs.reopen()">{{ 'consent.manage' | t }}</button>
            </p>
          </div>
          <app-social-links [attr.aria-label]="'footer.social' | t" />
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--bg-canvas);
      border-top: 1px solid var(--border-default);
      padding: var(--space-4xl) 0 calc(var(--space-2xl) + 72px);
      overflow: hidden;
    }
    .stack {
      display: flex;
      flex-direction: column;
      gap: var(--space-3xl);
    }
    .statement {
      max-width: 14em;
    }
    .wordmark {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: var(--fs-wordmark);
      line-height: 0.95;
      letter-spacing: -0.04em;
      color: var(--text-brand);
      white-space: nowrap;
      will-change: transform;
    }
    .base {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-lg);
      flex-wrap: wrap;
    }
    .credits {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: var(--fs-small);
      color: var(--text-secondary);
    }
    .credits a,
    .link {
      color: var(--text-primary);
    }
    .link {
      text-decoration: underline;
      font-size: inherit;
    }
    @media (max-width: 767.98px) {
      .footer {
        padding-top: var(--space-3xl);
      }
      .stack {
        gap: var(--space-xl);
      }
      .base {
        flex-direction: column-reverse;
        align-items: flex-start;
      }
    }
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
  protected readonly authorUrl = SITE.authorUrl;
  protected readonly prefs = inject(PreferencesService);
  private readonly wordmark = viewChild.required<ElementRef<HTMLElement>>('wordmark');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced()) return;
      const el = this.wordmark().nativeElement;
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.transform = `translateX(${(0.5 - progress) * 12}%)`;
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        cancelAnimationFrame(raf);
      });
    });
  }
}
