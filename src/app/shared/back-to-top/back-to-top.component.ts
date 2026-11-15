import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ScrollService } from '../../core/services/scroll.service';
import { IconComponent } from '../icons/icon.component';

/**
 * Seta flutuante (canto inferior direito). Escondida no primeiro ecrã; aparece
 * (fade + subida 8px) depois de o hero sair do ecrã e esconde-se ao voltar ao topo.
 */
@Component({
  selector: 'app-back-to-top',
  imports: [TranslatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="fab"
      [class.is-visible]="visible()"
      [attr.aria-hidden]="visible() ? null : 'true'"
      [attr.tabindex]="visible() ? null : -1"
      [attr.aria-label]="'common.backToTop' | t"
      (click)="scroll.scrollTo('top')"
    >
      <app-icon name="arrow-up" />
    </button>
  `,
  styles: `
    .fab {
      position: fixed;
      right: max(20px, env(safe-area-inset-right));
      bottom: max(20px, env(safe-area-inset-bottom));
      z-index: var(--z-fab);
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background: var(--brand-primary);
      color: var(--text-on-brand);
      box-shadow: var(--shadow-card);
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      transition: opacity 200ms ease, transform 200ms ease, background-color var(--dur-fast) ease;
    }
    .fab.is-visible {
      opacity: 1;
      transform: none;
      pointer-events: auto;
    }
    .fab:hover {
      background: var(--brand-primary-hover);
    }
  `,
})
export class BackToTopComponent {
  protected readonly scroll = inject(ScrollService);
  protected readonly visible = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const hero = document.getElementById('inicio');
      if (!hero) return;
      const io = new IntersectionObserver(([e]) => this.visible.set(!e.isIntersecting), { threshold: 0 });
      io.observe(hero);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
