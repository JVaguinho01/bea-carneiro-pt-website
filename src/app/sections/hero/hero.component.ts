import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MotionService } from '../../core/services/motion.service';
import { ScrollService } from '../../core/services/scroll.service';
import { HERO_PHOTOS } from '../../data/content';
import { IconComponent } from '../../shared/icons/icon.component';
import { PhotoRotatorComponent } from '../../shared/photo-rotator/photo-rotator.component';

/**
 * Hero: título revela palavra a palavra, fotos de treino a rodar (4s), chips a flutuar,
 * glow coral que segue o rato (só desktop). Sem indicador de scroll: a foto passa a
 * dobra do ecrã e dissolve-se num fade.
 */
@Component({
  selector: 'app-hero',
  imports: [TranslatePipe, IconComponent, PhotoRotatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly scroll = inject(ScrollService);
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  protected readonly photos = HERO_PHOTOS;

  protected readonly titleWords = computed(() => this.i18n.t('hero.title').split(' '));

  private readonly glow = viewChild<ElementRef<HTMLElement>>('glow');
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const glow = this.glow()?.nativeElement;
      if (!glow || !this.motion.finePointer() || this.motion.reduced()) return;
      const host = this.section().nativeElement;
      // posição em píxeis dentro do hero (centro do brilho = ponta do rato)
      let tx = host.clientWidth * 0.7, ty = host.clientHeight * 0.4, x = tx, y = ty, raf = 0;
      let last = performance.now();
      const loop = (now: number) => {
        // segue o rato de perto, com um atraso curto (~80ms) e igual em qualquer ecrã (60/120Hz)
        const k = 1 - Math.exp(-(now - last) / 80);
        last = now;
        x += (tx - x) * k;
        y += (ty - y) * k;
        glow.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        raf = requestAnimationFrame(loop);
      };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
      };
      host.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(loop);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        host.removeEventListener('pointermove', onMove);
      });
    });
  }
}
