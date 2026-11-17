import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { THEME_MODES, ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../icons/icon.component';

const ICON = { system: 'monitor', light: 'sun', dark: 'moon' } as const;

@Component({
  selector: 'app-theme-switch',
  imports: [TranslatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-dark]': 'tone() === "dark"' },
  template: `
    <div class="switch" role="group" [attr.aria-label]="'theme.label' | t">
      @for (m of modes; track m) {
        <button
          type="button"
          [class.is-active]="theme.mode() === m"
          [attr.aria-pressed]="theme.mode() === m"
          [attr.aria-label]="'theme.' + m | t"
          [attr.title]="'theme.' + m | t"
          (click)="theme.setMode(m)"
        >
          <app-icon [name]="icon[m]" [size]="16" />
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
      display: grid;
      place-items: center;
      width: 30px;
      height: 26px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease;
    }
    button::after {
      content: '';
      position: absolute;
      inset: -9px -1px;
    }
    button:hover:not(.is-active) {
      color: var(--text-primary);
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
      color: var(--bg-inverse);
    }
  `,
})
export class ThemeSwitchComponent {
  readonly tone = input<'light' | 'dark'>('light');
  protected readonly theme = inject(ThemeService);
  protected readonly modes = THEME_MODES;
  protected readonly icon = ICON;
}
