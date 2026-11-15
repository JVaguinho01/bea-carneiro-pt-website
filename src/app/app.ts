import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Links que levam para fora do site (separador novo, download, email, telefone). */
const EXIT_LINK = 'a[target="_blank"], a[download], a[href^="mailto:"], a[href^="tel:"]';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
  host: {
    '(document:click)': 'releaseExitLink($event)',
    '(document:dragstart)': 'blockImageGrab($event)',
    '(document:contextmenu)': 'blockImageGrab($event)',
  },
})
export class App {
  /**
   * Fotos e links não se arrastam nem abrem o menu de "guardar/copiar" ao segurar (toque longo)
   * ou com o botão direito sobre uma foto. Complementa o user-select: none global.
   */
  protected blockImageGrab(event: Event): void {
    const t = event.target as Element | null;
    if (event.type === 'dragstart' ? t?.closest?.('img, a') : t?.closest?.('img')) event.preventDefault();
  }

  /**
   * Em telemóvel/tablet, ao voltar ao site o link tocado ficava com foco e parecia "clicado".
   * Após o clique numa ação externa, tira-se o foco para o botão voltar ao estado normal.
   * (O hover só existe em dispositivos com rato: ver @media (hover: hover) nos estilos.)
   */
  protected releaseExitLink(event: MouseEvent): void {
    const link = (event.target as Element | null)?.closest?.(EXIT_LINK);
    if (link instanceof HTMLElement) setTimeout(() => link.blur());
  }
}
