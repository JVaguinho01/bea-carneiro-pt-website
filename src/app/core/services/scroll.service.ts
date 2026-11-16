import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

export type SectionId = 'top' | 'sobre' | 'conquistas' | 'servicos' | 'galeria' | 'testemunhos' | 'contactos';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly document = inject(DOCUMENT);

  readonly contactSubject = signal<string | null>(null);

  scrollTo(id: SectionId): void {
    const win = this.document.defaultView;
    if (!win) return;
    const behavior: ScrollBehavior = win.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

    if (id === 'top') {
      win.scrollTo({ top: 0, behavior });
      this.document.getElementById('conteudo')?.focus({ preventScroll: true });
      return;
    }

    const target = this.document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior, block: 'start' });

    const heading = target.querySelector<HTMLElement>('h2, h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      win.setTimeout(() => heading.focus({ preventScroll: true }), behavior === 'smooth' ? 600 : 0);
    }
  }

  goToContact(subject?: string): void {
    if (subject) this.contactSubject.set(subject);
    this.scrollTo('contactos');
  }
}
