import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

/** Estado de "reduzir movimento" e tipo de ponteiro, partilhado pelos componentes. */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly win = inject(DOCUMENT).defaultView;

  readonly reduced = signal(this.query('(prefers-reduced-motion: reduce)'));
  readonly finePointer = signal(this.query('(hover: hover) and (pointer: fine)'));

  constructor() {
    this.win?.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => this.reduced.set(e.matches));
  }

  private query(q: string): boolean {
    return !!this.win?.matchMedia(q).matches;
  }
}
