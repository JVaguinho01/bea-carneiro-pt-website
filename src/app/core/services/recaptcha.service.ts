import { DOCUMENT, Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

interface Grecaptcha {
  ready(cb: () => void): void;
  render(el: HTMLElement, opts: Record<string, unknown>): number;
  reset(id?: number): void;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

/**
 * Google reCAPTCHA v2 (caixa "Não sou um robô"), carregado só quando o formulário
 * está perto do ecrã (não pesa no arranque nem traz cookies da Google a quem não o usa).
 * O token vai com a mensagem para o EmailJS, que o valida com a chave secreta.
 */
@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly document = inject(DOCUMENT);
  private loading?: Promise<Grecaptcha>;

  readonly enabled = Boolean(environment.recaptchaSiteKey);

  load(lang: string): Promise<Grecaptcha> {
    if (this.loading) return this.loading;
    this.loading = new Promise<Grecaptcha>((resolve, reject) => {
      const script = this.document.createElement('script');
      const hl = lang === 'pt' ? 'pt-PT' : 'en';
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${hl}`;
      script.async = true;
      script.defer = true;
      script.onload = () => window.grecaptcha!.ready(() => resolve(window.grecaptcha!));
      script.onerror = () => {
        this.loading = undefined;
        reject(new Error('recaptcha'));
      };
      this.document.head.appendChild(script);
    });
    return this.loading;
  }

  render(el: HTMLElement, onToken: (token: string | null) => void, lang: string): Promise<number> {
    return this.load(lang).then(g =>
      g.render(el, {
        sitekey: environment.recaptchaSiteKey,
        // segue o tema do site (modo escuro do sistema → widget escuro)
        theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      }),
    );
  }

  reset(id: number | null): void {
    if (id !== null) window.grecaptcha?.reset(id);
  }
}
