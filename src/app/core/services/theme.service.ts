import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';
import { PreferencesService } from './preferences.service';

export type ThemeMode = 'system' | 'light' | 'dark';
export const THEME_MODES: readonly ThemeMode[] = ['system', 'light', 'dark'];

const THEME_COLOR = { light: '#1f4a35', dark: '#0b1a13' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly prefs = inject(PreferencesService);
  private readonly mq = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');
  private readonly systemDark = signal(!!this.mq?.matches);

  readonly mode = signal<ThemeMode>(this.saved());
  readonly resolved = computed(() =>
    this.mode() === 'system' ? (this.systemDark() ? 'dark' : 'light') : (this.mode() as 'light' | 'dark'),
  );

  constructor() {
    this.mq?.addEventListener('change', e => this.systemDark.set(e.matches));
    effect(() => {
      const mode = this.mode();
      const root = this.document.documentElement;
      if (mode === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', mode);
      this.document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(m => {
        const own = m.media.includes('dark') ? 'dark' : 'light';
        m.content = THEME_COLOR[mode === 'system' ? own : mode];
      });
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    this.prefs.set('bc-theme', mode === 'system' ? null : mode);
  }

  private saved(): ThemeMode {
    const v = this.prefs.get('bc-theme');
    return v === 'light' || v === 'dark' ? v : 'system';
  }
}
