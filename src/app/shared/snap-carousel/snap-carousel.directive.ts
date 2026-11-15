import { Directive, ElementRef, inject, signal } from '@angular/core';

/**
 * Carrossel com swipe nativo (CSS scroll-snap) para o mobile. Só lê a posição
 * para saber qual cartão está visível (para os traços indicadores).
 * Uso: <ul appSnapCarousel #c="snapCarousel"> … {{ c.index() }}
 */
@Directive({
  selector: '[appSnapCarousel]',
  exportAs: 'snapCarousel',
  host: { '(scroll)': 'onScroll()' },
})
export class SnapCarouselDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly index = signal(0);
  private raf = 0;

  protected onScroll(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      const track = this.el.nativeElement;
      const first = track.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
      this.index.set(Math.round(track.scrollLeft / Math.max(step, 1)));
    });
  }

  goTo(i: number): void {
    const item = this.el.nativeElement.children.item(i) as HTMLElement | null;
    item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
}
