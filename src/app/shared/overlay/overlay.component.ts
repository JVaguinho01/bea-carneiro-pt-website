import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

/**
 * Painel sobre a página escurecida (serviços, testemunhos, visualizador de fotos).
 * Usa <dialog> nativo: foco preso dentro, ESC fecha, o resto da página fica inerte.
 *
 * - ≥ 768px: painel centrado. Layout pela orientação (CSS de cada conteúdo):
 *   horizontal (landscape ≥ 1024px) → 2 colunas; vertical → 1 coluna.
 *   Sem botão X: fecha com clique no fundo ou ESC (há um "Fechar" só para leitores de ecrã).
 * - < 768px: bottom sheet que sobe de baixo; fecha a arrastar a pega para baixo
 *   (mais de 30% da altura) ou a tocar no fundo. Pode ter scroll interno.
 */
@Component({
  selector: 'app-overlay',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      class="overlay"
      [class.is-wide]="variant() === 'wide'"
      [class.is-viewer]="variant() === 'viewer'"
      [class.is-closing]="closing()"
      [attr.aria-label]="label()"
      (cancel)="onCancel($event)"
      (click)="onBackdropClick($event)"
    >
      <div class="panel" #panel tabindex="-1" autofocus [style.transform]="dragOffset() ? 'translateY(' + dragOffset() + 'px)' : null">
        <div
          class="handle"
          (pointerdown)="onDragStart($event)"
          (pointermove)="onDragMove($event)"
          (pointerup)="onDragEnd()"
          (pointercancel)="onDragEnd()"
          aria-hidden="true"
        >
          <span></span>
        </div>
        <button type="button" class="visually-hidden sr-close" (click)="close()">{{ 'common.close' | t }}</button>
        <div class="content">
          <ng-content />
        </div>
      </div>
    </dialog>
  `,
  styleUrl: './overlay.component.scss',
})
export class OverlayComponent {
  readonly open = input(false);
  readonly label = input('');
  readonly variant = input<'wide' | 'viewer'>('wide');
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly document = inject(DOCUMENT);

  protected readonly closing = signal(false);
  protected readonly dragOffset = signal(0);
  private dragStartY: number | null = null;
  private opener: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open() && !el.open) {
        this.opener = this.document.activeElement as HTMLElement | null;
        this.closing.set(false);
        this.dragOffset.set(0);
        el.showModal();
        this.document.body.classList.add('is-locked');
        el.scrollTop = 0;
        this.panel().nativeElement.querySelector<HTMLElement>('.content')?.scrollTo({ top: 0 });
      } else if (!this.open() && el.open) {
        this.finishClose();
      }
    });
  }

  close(): void {
    if (this.closing()) return;
    const reduced = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.closing.set(true);
    setTimeout(() => this.closed.emit(), reduced ? 0 : 200);
  }

  /** Fecha já, sem animação nem devolver o foco (usado antes de navegar para outra secção). */
  closeNow(): void {
    this.opener = null;
    if (this.dialog().nativeElement.open) this.finishClose();
  }

  private finishClose(): void {
    const el = this.dialog().nativeElement;
    el.close();
    this.document.body.classList.remove('is-locked');
    this.closing.set(false);
    this.dragOffset.set(0);
    this.opener?.focus({ preventScroll: true });
  }

  protected onCancel(event: Event): void {
    event.preventDefault(); // ESC: anima o fecho em vez de fechar logo
    this.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    // O clique no ::backdrop chega ao próprio <dialog> (fora do painel).
    if (event.target === this.dialog().nativeElement) this.close();
  }

  // ---- Arrastar a pega para fechar (mobile) ---------------------------------
  protected onDragStart(e: PointerEvent): void {
    this.dragStartY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  protected onDragMove(e: PointerEvent): void {
    if (this.dragStartY === null) return;
    this.dragOffset.set(Math.max(0, e.clientY - this.dragStartY));
  }

  protected onDragEnd(): void {
    if (this.dragStartY === null) return;
    this.dragStartY = null;
    const height = this.panel().nativeElement.offsetHeight || 1;
    if (this.dragOffset() > height * 0.3) {
      this.close();
    } else {
      this.dragOffset.set(0); // volta para cima
    }
  }
}
