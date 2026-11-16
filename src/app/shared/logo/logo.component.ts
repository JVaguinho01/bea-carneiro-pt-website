import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LOGO_PATH, LOGO_VIEWBOX } from './logo-path';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.height.px]': 'height()' },
  template: `
    <svg [attr.viewBox]="viewBox" fill="currentColor" aria-hidden="true" focusable="false">
      <path [attr.d]="path" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-block;
      color: var(--brand-primary);
      aspect-ratio: 128.279 / 106;
      line-height: 0;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class LogoComponent {
  readonly height = input(40);
  protected readonly viewBox = LOGO_VIEWBOX;
  protected readonly path = LOGO_PATH;
}
