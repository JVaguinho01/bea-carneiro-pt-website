import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PreferencesService } from '../services/preferences.service';
import pt from '../../../i18n/pt.json';
import en from '../../../i18n/en.json';

export type Lang = 'pt' | 'en';
export const LANGS: readonly Lang[] = ['pt', 'en'];

type Dictionary = typeof pt;
const DICTIONARIES: Record<Lang, Dictionary> = { pt, en };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly prefs = inject(PreferencesService);

  readonly lang = signal<Lang>(this.detect());
  readonly dict = computed(() => DICTIONARIES[this.lang()]);

  get<T = unknown>(key: string): T {
    return key.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[part];
      return undefined;
    }, this.dict()) as T;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const value = this.get<unknown>(key);
    if (typeof value !== 'string') return key;
    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? `{${p}}`));
  }

  setLang(lang: Lang): void {
    if (!LANGS.includes(lang)) return;
    this.lang.set(lang);
    this.prefs.set('bc-lang', lang);
    this.applyToDocument();
  }

  applyToDocument(): void {
    const lang = this.lang();
    this.document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
    this.title.setTitle(this.t('meta.title'));
    this.meta.updateTag({ name: 'description', content: this.t('meta.description') });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'pt' ? 'pt_PT' : 'en_GB' });
  }

  detect(): Lang {
    const saved = this.prefs.get('bc-lang');
    if (saved === 'pt' || saved === 'en') return saved;
    const nav = this.document.defaultView?.navigator;
    const prefs = nav?.languages?.length ? nav.languages : [nav?.language ?? 'en'];
    return prefs.some(l => l.toLowerCase().startsWith('pt')) ? 'pt' : 'en';
  }
}
