import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

export type SectionId = 'top' | 'sobre' | 'conquistas' | 'servicos' | 'galeria' | 'testemunhos' | 'contactos';

/** Navegação interna: scroll suave até às secções e assunto pré-preenchido do formulário. */
@Injectable({ providedIn: 'root' })
export class ScrollService {
  private readonly document = inject(DOCUMENT);

  /** Assunto a pré-preencher no formulário (vindo de um painel de serviço). */
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
    // a secção encaixa no topo do ecrã; o cabeçalho (fixo) flutua sobre o padding dela
    target.scrollIntoView({ behavior, block: 'start' });

    // Acessibilidade: o foco passa para o título da secção, sem mexer no scroll.
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
