import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type SendResult = 'ok' | 'rate-limited' | 'not-configured' | 'error' | 'captcha';

const RATE_KEY = 'bc-contact-sent';
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_MAX = 3; // no máximo 3 mensagens por janela, por browser

/**
 * Envia o formulário diretamente para o email da Beatriz através do EmailJS
 * (sem back-end próprio, sem abrir o programa de email).
 * Proteções do lado do cliente: limite de envios, bloqueio de browsers automáticos
 * (blockHeadless) e limpeza dos campos. A proteção principal fica no painel do
 * EmailJS (domínios permitidos + limite de pedidos).
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  readonly configured = Boolean(
    environment.emailjs.serviceId && environment.emailjs.templateId && environment.emailjs.publicKey,
  );

  async send(msg: ContactMessage, lang: string, captchaToken: string | null = null): Promise<SendResult> {
    if (!this.configured) return 'not-configured';
    if (this.isRateLimited()) return 'rate-limited';
    // com reCAPTCHA ativo, nunca envia sem o token (a validação final é feita pelo EmailJS)
    if (environment.recaptchaSiteKey && !captchaToken) return 'captcha';

    try {
      // Carregado só quando é preciso (não pesa no carregamento inicial).
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(
        environment.emailjs.serviceId,
        environment.emailjs.templateId,
        {
          from_name: clean(msg.name, 80),
          reply_to: clean(msg.email, 120),
          subject: clean(msg.subject, 120),
          message: clean(msg.message, 2000, true),
          site_language: lang,
          // o EmailJS valida este token com a chave secreta do reCAPTCHA (definida no template)
          ...(captchaToken ? { 'g-recaptcha-response': captchaToken } : {}),
        },
        {
          publicKey: environment.emailjs.publicKey,
          blockHeadless: true,
          limitRate: { id: 'contact-form', throttle: 30_000 }, // 1 envio a cada 30s
        },
      );
      this.registerSend();
      return 'ok';
    } catch (err: unknown) {
      const status = (err as { status?: number } | null)?.status;
      return status === 429 ? 'rate-limited' : 'error';
    }
  }

  private history(): number[] {
    try {
      const raw = JSON.parse(localStorage.getItem(RATE_KEY) ?? '[]');
      return Array.isArray(raw) ? raw.filter((t): t is number => typeof t === 'number') : [];
    } catch {
      return [];
    }
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    return this.history().filter(t => now - t < RATE_WINDOW_MS).length >= RATE_MAX;
  }

  private registerSend(): void {
    const now = Date.now();
    const recent = this.history().filter(t => now - t < RATE_WINDOW_MS);
    try {
      localStorage.setItem(RATE_KEY, JSON.stringify([...recent, now]));
    } catch {
      /* ignora */
    }
  }
}

/** Remove caracteres de controlo, limita o tamanho e tira espaços a mais. */
function clean(value: string, max: number, multiline = false): string {
  const pattern = multiline ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return value.replace(pattern, '').trim().slice(0, max);
}
