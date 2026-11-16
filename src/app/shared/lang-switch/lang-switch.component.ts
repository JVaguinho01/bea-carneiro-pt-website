import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService, LANGS, Lang } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-lang-switch',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-dark]': 'tone() === "dark"' },
  template: `
    <div class="switch" role="group" [attr.aria-label]="'nav.language' | t">
      @for (l of langs; track l) {
        <button
          type="button"
          [class.is-active]="i18n.lang() === l"
          [attr.aria-pressed]="i18n.lang() === l"
          [attr.lang]="l === 'pt' ? 'pt-PT' : 'en'"
          [attr.aria-label]="'nav.switchTo' | t: { lang: l === 'pt' ? 'Português' : 'English' }"
          (click)="select(l)"
        >
          {{ l.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: `
    .switch {
      display: inline-flex;
      gap: 2px;
      padding: 3px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-full);
    }
    button {
      position: relative;
      min-width: 36px;
      height: 26px;
      padding-inline: 6px;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: var(--fs-overline);
      letter-spacing: 0.12em;
      color: var(--text-secondary);
      transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
    }
    button::after {
      content: '';
      position: absolute;
      inset: -9px -2px;
    }
    button.is-active {
      background: var(--brand-primary);
      color: var(--text-on-brand);
    }
    :host(.is-dark) .switch {
      border-color: var(--border-inverse);
    }
    :host(.is-dark) button {
      color: var(--text-inverse-secondary);
    }
    :host(.is-dark) button.is-active {
      background: var(--text-inverse);
      color: var(--text-primary);
    }
  `,
})
export class LangSwitchComponent {
  readonly tone = input<'light' | 'dark'>('light');
  protected readonly i18n = inject(I18nService);
  protected readonly langs = LANGS;

  protected select(lang: Lang): void {
    this.i18n.setLang(lang);
  }
}
