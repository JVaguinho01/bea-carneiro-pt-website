import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
  protected blockImageGrab(event: Event): void {
    const t = event.target as Element | null;
    if (event.type === 'dragstart' ? t?.closest?.('img, a') : t?.closest?.('img')) event.preventDefault();
  }

  protected releaseExitLink(event: MouseEvent): void {
    const link = (event.target as Element | null)?.closest?.(EXIT_LINK);
    if (link instanceof HTMLElement) setTimeout(() => link.blur());
  }
}
