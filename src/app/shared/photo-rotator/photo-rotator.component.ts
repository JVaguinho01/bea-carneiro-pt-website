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
 * Fotos que rodam sozinhas (crossfade). Pausa ao passar o rato, quando sai do ecrã
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
    <div class="frame photo" [style.aspect-ratio]="ratio()">
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
          [attr.aria-hidden]="i === index() ? null : 'true'"
          [attr.loading]="eager() && i === 0 ? 'eager' : 'lazy'"
          [attr.fetchpriority]="eager() && i === 0 ? 'high' : null"
          decoding="async"
        />
      }
      <ng-content />
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

  protected go(i: number): void {
    this.index.set(i);
  }

  private next(): void {
    this.index.update(i => (i + 1) % this.photos().length);
  }
}
