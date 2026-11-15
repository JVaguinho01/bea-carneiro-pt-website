import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ScrollService, SectionId } from '../../core/services/scroll.service';
import { LogoComponent } from '../../shared/logo/logo.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { LangSwitchComponent } from '../../shared/lang-switch/lang-switch.component';
import { SocialLinksComponent } from '../../shared/social-links/social-links.component';

interface NavLink {
  id: Exclude<SectionId, 'top'>;
  key: string;
}

/**
 * Cabeçalho fixo: esconde ao descer, volta ao subir; o link da secção visível fica marcado.
 * Desktop: links visíveis. Tablet/mobile: botão de menu que abre o menu em ecrã inteiro.
 */
@Component({
  selector: 'app-header',
  imports: [TranslatePipe, LogoComponent, IconComponent, LangSwitchComponent, SocialLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    '[class.is-hidden]': 'hidden() && !menuOpen()',
    '[class.is-scrolled]': 'scrolled()',
  },
})
export class HeaderComponent {
  protected readonly scroll = inject(ScrollService);
  private readonly document = inject(DOCUMENT);

  protected readonly links: NavLink[] = [
    { id: 'sobre', key: 'nav.about' },
    { id: 'conquistas', key: 'nav.achievements' },
    { id: 'servicos', key: 'nav.services' },
    { id: 'galeria', key: 'nav.gallery' },
    { id: 'testemunhos', key: 'nav.testimonials' },
    { id: 'contactos', key: 'nav.contact' },
  ];

  protected readonly active = signal<string | null>(null);
  protected readonly hidden = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  private readonly menuDialog = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = this.document.defaultView!;

      // Esconder ao descer / mostrar ao subir
      let lastY = win.scrollY;
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        win.requestAnimationFrame(() => {
          const y = win.scrollY;
          this.scrolled.set(y > 8);
          if (Math.abs(y - lastY) > 6) {
            this.hidden.set(y > lastY && y > 200);
            lastY = y;
          }
          ticking = false;
        });
      };
      win.addEventListener('scroll', onScroll, { passive: true });

      // Link ativo = secção que ocupa a faixa central do ecrã
      const io = new IntersectionObserver(
        entries => {
          for (const e of entries) if (e.isIntersecting) this.active.set(e.target.id);
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      for (const l of this.links) {
        const el = this.document.getElementById(l.id);
        if (el) io.observe(el);
      }
      const hero = this.document.getElementById('inicio');
      if (hero) io.observe(hero);

      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        io.disconnect();
      });
    });
  }

  protected go(id: SectionId, event?: Event): void {
    event?.preventDefault();
    const wasOpen = this.menuOpen();
    if (wasOpen) this.closeMenu(false);
    this.scroll.scrollTo(id);
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
    this.menuDialog().nativeElement.showModal();
    this.document.body.classList.add('is-locked');
  }

  protected closeMenu(restoreFocus = true): void {
    this.menuOpen.set(false);
    this.menuDialog().nativeElement.close();
    this.document.body.classList.remove('is-locked');
    if (restoreFocus) this.menuButton()?.nativeElement.focus();
  }

  protected onMenuCancel(event: Event): void {
    event.preventDefault();
    this.closeMenu();
  }
}
