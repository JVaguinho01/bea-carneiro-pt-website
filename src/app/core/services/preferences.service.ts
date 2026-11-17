import { Injectable, signal } from '@angular/core';

export type Consent = 'granted' | 'denied';

const CONSENT_KEY = 'bc-consent';
export const PREF_KEYS = ['bc-theme', 'bc-lang'] as const;
type PrefKey = (typeof PREF_KEYS)[number];

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly consent = signal<Consent | null>(read(CONSENT_KEY) as Consent | null);
  readonly cardOpen = signal(this.consent() === null);
  private readonly pending = new Map<PrefKey, string>();

  get(key: PrefKey): string | null {
    return this.consent() === 'granted' ? read(key) : null;
  }

  set(key: PrefKey, value: string | null): void {
    if (value === null) this.pending.delete(key);
    else this.pending.set(key, value);
    if (this.consent() === 'granted') write(key, value);
  }

  decide(consent: Consent): void {
    this.consent.set(consent);
    write(CONSENT_KEY, consent);
    for (const key of PREF_KEYS) write(key, consent === 'granted' ? (this.pending.get(key) ?? null) : null);
    this.cardOpen.set(false);
  }

  reopen(): void {
    this.cardOpen.set(true);
  }
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
  }
}
