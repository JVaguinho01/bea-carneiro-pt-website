import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

/**
 * Revela o elemento ao entrar no ecrã (fade + subida). Uso: <div appReveal [revealDelay]="120">.
 * Respeita "reduzir movimento" (o CSS em _components.scss mostra logo o conteúdo).
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[style.--reveal-delay]': 'revealDelay() + "ms"',
  },
})
export class RevealDirective implements OnDestroy {
  readonly revealDelay = input(0);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      if (!('IntersectionObserver' in window)) {
        node.classList.add('is-visible');
        return;
      }
      this.observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              node.classList.add('is-visible');
              this.observer?.disconnect();
            }
          }
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
      );
      this.observer.observe(node);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
