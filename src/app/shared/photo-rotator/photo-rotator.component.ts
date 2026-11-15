import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Photo } from '../../data/photo.model';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MotionService } from '../../core/services/motion.service';

/**
 * Fotos que rodam sozinhas (crossfade). Também mudam com swipe (toque) ou clique nas margens (rato). Pausa ao passar o rato, quando sai do ecrã
 * e com "reduzir movimento". Indicador: pontos (hero/sobre) ou barras de progresso (conquistas).
 */
@Component({
  selector: 'app-photo-rotator',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'hovered.set(true)',
    '(focusout)': 'hovered.set(false)',
    '[class.is-bars]': 'indicator() === "bars"',
    '[style.--rotate-ms]': 'intervalMs() + "ms"',
  },
  template: `
    <div
      class="frame photo"
      [class.is-slide]="slideDir() !== 0"
      [class.is-slide-prev]="slideDir() === -1"
      [style.aspect-ratio]="ratio()"
      (pointerdown)="onPointerDown($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="swipeStart = null"
    >
      @for (p of photos(); track p.id; let i = $index) {
        <img
          [src]="p.src"
          [attr.srcset]="p.srcSm + ' 640w, ' + p.src + ' ' + p.w + 'w'"
          [attr.sizes]="sizes()"
          [width]="p.w"
          [height]="p.h"
          [alt]="altParams() ? (p.altKey | t: altParams()!) : (p.altKey | t)"
          [style.object-position]="p.focus || 'center'"
          [class.is-active]="i === index()"
          [class.is-leaving]="slideDir() !== 0 && i === leaving()"
          [attr.aria-hidden]="i === index() ? null : 'true'"
          [attr.loading]="eager() && i === 0 ? 'eager' : 'lazy'"
          [attr.fetchpriority]="eager() && i === 0 ? 'high' : null"
          decoding="async"
        />
      }
      <ng-content />
      <!-- Computador: clicar na margem esquerda/direita da foto anda para trás/frente.
           Carrossel finito: cada margem só existe se houver foto nesse sentido. -->
      @if (index() > 0) {
        <div class="edge edge--prev" aria-hidden="true" (click)="slide(-1)"><span>&lsaquo;</span></div>
      }
      @if (index() < photos().length - 1) {
        <div class="edge edge--next" aria-hidden="true" (click)="slide(1)"><span>&rsaquo;</span></div>
      }
      @if (indicator() === 'dots' && photos().length > 1) {
        <div class="rotation-dots dots" role="group" [attr.aria-label]="'common.photoOf' | t: { n: index() + 1, total: photos().length }">
          @for (p of photos(); track p.id; let i = $index) {
            <button
              type="button"
              [attr.aria-current]="i === index()"
              [attr.aria-label]="'common.showPhoto' | t: { n: i + 1 }"
              (click)="go(i)"
            ></button>
          }
        </div>
      }
    </div>
    @if (indicator() === 'bars' && photos().length > 1) {
      <div class="bars" role="group" [attr.aria-label]="'common.photoOf' | t: { n: index() + 1, total: photos().length }">
        @for (p of photos(); track p.id; let i = $index) {
          <button
            type="button"
            [class.is-done]="i < index()"
            [class.is-active]="i === index()"
            [class.is-paused]="paused()"
            [attr.aria-label]="'common.showPhoto' | t: { n: i + 1 }"
            (click)="go(i)"
          >
            <span></span>
          </button>
        }
      </div>
    }
  `,
  styleUrl: './photo-rotator.component.scss',
})
export class PhotoRotatorComponent {
  readonly photos = input.required<Photo[]>();
  readonly intervalMs = input(4000);
  readonly ratio = input('4 / 5');
  readonly sizes = input('(max-width: 767px) 100vw, 520px');
  readonly indicator = input<'dots' | 'bars'>('dots');
  readonly eager = input(false);
  readonly altParams = input<Record<string, string | number> | null>(null);

  protected readonly index = signal(0);
  protected readonly hovered = signal(false);
  private readonly inView = signal(false);
  protected readonly paused = signal(false);

  private readonly motion = inject(MotionService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Ao trocar de conjunto de fotos (ex.: outra conquista), recomeça na 1.ª.
    effect(() => {
      this.photos();
      this.index.set(0);
    });

    effect(() => {
      const shouldRun = this.inView() && !this.hovered() && !this.motion.reduced() && this.photos().length > 1;
      this.paused.set(!shouldRun);
      this.index(); // reinicia o temporizador sempre que a foto muda
      clearTimeout(this.timer);
      if (shouldRun) this.timer = setTimeout(() => this.next(), this.intervalMs());
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const io = new IntersectionObserver(([e]) => this.inView.set(e.isIntersecting), { threshold: 0.2 });
      io.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => io.disconnect());
    });
    destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  /**
   * Tipo de animação da última troca: 0 = fade (temporizador e pontos/barras);
   * 1 / -1 = slide para a seguinte / anterior (setas no computador e swipe no toque).
   */
  protected readonly slideDir = signal<0 | 1 | -1>(0);
  /** Foto que sai a deslizar durante o slide. */
  protected readonly leaving = signal(-1);

  /** Pontos/barras: fade. */
  protected go(i: number): void {
    this.slideDir.set(0);
    this.index.set(i);
  }

  /** Temporizador: fade. */
  private next(): void {
    this.slideDir.set(0);
    this.index.update(i => (i + 1) % this.photos().length);
  }

  /**
   * Setas e swipe: slide no sentido do gesto, em carrossel finito
   * (na 1.ª foto não se recua, na última não se avança).
   * O temporizador continua a voltar à 1.ª no fim, com fade.
   */
  protected slide(dir: 1 | -1): void {
    const target = this.index() + dir;
    if (target < 0 || target >= this.photos().length) return;
    if (this.motion.reduced()) return this.go(target);
    this.leaving.set(this.index());
    this.slideDir.set(dir);
    this.index.set(target);
  }

  /** Tablet/telemóvel: deslizar o dedo na foto (esquerda → seguinte, direita → anterior). */
  protected swipeStart: { x: number; y: number } | null = null;

  protected onPointerDown(e: PointerEvent): void {
    this.swipeStart = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
  }

  protected onPointerUp(e: PointerEvent): void {
    const s = this.swipeStart;
    this.swipeStart = null;
    if (!s || this.photos().length < 2) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    this.slide(dx < 0 ? 1 : -1);
  }
}
