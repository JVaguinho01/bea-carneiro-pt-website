import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';
import { Photo } from '../../data/photo.model';
import { MotionService } from '../../core/services/motion.service';
import { SITE } from '../../core/config/site.config';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { INSTAGRAM_PHOTOS } from '../../data/content';
import { IconComponent } from '../../shared/icons/icon.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

/**
 * Instagram: fotos pessoais da Beatriz (guardadas no site, sem carregar nada do
 * Instagram — mais rápido e sem cookies de terceiros). Mostra 4 de cada vez, escolhidas
 * ao acaso, e a cada 3,5s uma delas troca por outra (crossfade). Clicar abre o perfil num
 * separador novo. O fundo expande a partir de um círculo ao entrar no ecrã.
 */
@Component({
  selector: 'app-instagram',
  imports: [TranslatePipe, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section section--brand instagram" appReveal aria-labelledby="instagram-title">
      <div class="container grid">
        <div class="text">
          <p class="t-overline handle">{{ 'instagram.handle' | t }}</p>
          <h2 id="instagram-title" class="t-display title">{{ 'instagram.title' | t }}</h2>
          <a class="btn btn--soft btn--block-mobile" [href]="url" target="_blank" rel="noopener noreferrer">
            {{ 'instagram.cta' | t }}
            <app-icon name="arrow-up-right" [size]="20" />
          </a>
        </div>
        <ul class="posts" (mouseenter)="hovered = true" (mouseleave)="hovered = false">
          @for (p of slots(); track $index; let i = $index) {
            <li>
              <a
                class="post photo"
                [style.--tilt]="tilts[i] + 'deg'"
                [href]="url"
                target="_blank"
                rel="noopener noreferrer"
                [attr.aria-label]="('instagram.postLabel' | t) + ' ' + ('common.newTab' | t)"
              >
                @for (q of [p]; track q.id) {
                <img
                  class="swap"
                  [src]="q.srcSm"
                  [width]="q.w"
                  [height]="q.h"
                  [alt]="q.altKey | t"
                  [style.object-position]="q.focus"
                  loading="lazy"
                  decoding="async"
                />
                }
                <app-icon name="instagram" class="badge" [size]="20" />
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .instagram {
      clip-path: circle(20% at 75% 50%);
      transition: clip-path 1200ms var(--ease-out);
      /* o reveal global mexe na opacidade; aqui queremos o círculo */
      opacity: 1 !important;
      transform: none !important;
    }
    .instagram.is-visible {
      clip-path: circle(150% at 75% 50%);
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 520px;
      gap: var(--space-4xl);
      align-items: center;
    }
    .text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-xl);
    }
    .handle {
      color: var(--text-inverse) !important;
    }
    .title {
      font-size: clamp(2.25rem, 1.2rem + 3vw, 4rem);
    }
    .posts {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);
    }
    .post {
      display: block;
      aspect-ratio: 1;
      transition: transform 400ms var(--ease-out);
    }
    .post:hover {
      transform: rotate(var(--tilt, -2deg)) scale(1.02);
    }
    .swap {
      animation: swap-in 700ms ease both;
    }
    @keyframes swap-in {
      from {
        opacity: 0;
      }
    }
    .badge {
      position: absolute;
      right: 10px;
      bottom: 10px;
      color: var(--white);
      filter: drop-shadow(0 1px 3px rgb(0 0 0 / 0.5));
    }
    @media (max-width: 1279.98px) {
      .grid {
        grid-template-columns: 1fr;
        gap: var(--space-2xl);
      }
      .posts {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    @media (max-width: 767.98px) {
      .posts {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-sm);
      }
      .text {
        gap: var(--space-lg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .instagram {
        clip-path: none;
      }
    }
  `,
})
export class InstagramComponent {
  protected readonly url = SITE.instagramUrl;
  private readonly pool: Photo[] = shuffle(INSTAGRAM_PHOTOS);
  protected readonly slots = signal<Photo[]>(this.pool.slice(0, 4));
  protected hovered = false;
  /** Inclinação no hover: para a esquerda ou para a direita, ao acaso (2–3°). */
  protected readonly tilts = [0, 1, 2, 3].map(() => (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random()));

  constructor() {
    const motion = inject(MotionService);
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.pool.length <= 4) return;
      let inView = false;
      let last = -1;
      const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting));
      io.observe(host.nativeElement);
      const timer = setInterval(() => {
        if (!inView || this.hovered || motion.reduced()) return;
        const current = this.slots();
        const unused = this.pool.filter(p => !current.includes(p));
        if (!unused.length) return;
        let slot = Math.floor(Math.random() * current.length);
        if (slot === last) slot = (slot + 1) % current.length; // não troca a mesma duas vezes seguidas
        last = slot;
        const next = unused[Math.floor(Math.random() * unused.length)];
        const img = new Image();
        img.src = next.srcSm;
        img.decode().then(() => this.slots.set(current.map((p, i) => (i === slot ? next : p)))).catch(() => undefined);
      }, 3500);
      destroyRef.onDestroy(() => {
        clearInterval(timer);
        io.disconnect();
      });
    });
  }
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
