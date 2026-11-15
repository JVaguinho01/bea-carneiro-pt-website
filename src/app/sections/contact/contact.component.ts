import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ContactService, SendResult } from '../../core/services/contact.service';
import { ScrollService } from '../../core/services/scroll.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';
import { SocialLinksComponent } from '../../shared/social-links/social-links.component';

type Status = 'idle' | 'sending' | 'success' | SendResult | 'too-fast';

/** Tempo mínimo (ms) entre abrir a página e enviar: bots preenchem tudo de imediato. */
const MIN_FILL_TIME = 3000;
/** Email simples e robusto (o validador do Angular aceita "a@b"). */
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
/** Nome: letras (com acentos), espaços, hífen, apóstrofo e ponto. */
const NAME_RE = /^[\p{L}][\p{L} .'’-]*$/u;

/**
 * Contactos: formulário que envia o email diretamente (EmailJS).
 * Valida ao sair de cada campo; estados a enviar / sucesso / erro no próprio formulário.
 * Anti-spam: campo isco escondido (honeypot), tempo mínimo de preenchimento e limite de envios.
 */
@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, TranslatePipe, IconComponent, RevealDirective, SocialLinksComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contact = inject(ContactService);
  private readonly i18n = inject(I18nService);
  private readonly scroll = inject(ScrollService);

  protected readonly configured = this.contact.configured;
  protected readonly status = signal<Status>('idle');
  private readonly startedAt = Date.now();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_RE)], updateOn: 'blur' }],
    email: ['', { validators: [Validators.required, Validators.maxLength(120), Validators.pattern(EMAIL_RE)], updateOn: 'blur' }],
    subject: ['', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)], updateOn: 'blur' }],
    message: ['', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)], updateOn: 'blur' }],
    /** Honeypot: invisível para pessoas; se vier preenchido, é um bot. */
    website: [''],
  });

  constructor() {
    // Assunto pré-preenchido quando se vem de um painel de serviço
    effect(() => {
      const subject = this.scroll.contactSubject();
      if (subject) {
        this.form.controls.subject.setValue(subject);
        this.form.controls.subject.markAsTouched();
        if (this.status() === 'success') this.status.set('idle');
      }
    });
  }

  protected errorKey(ctrl: AbstractControl): { key: string; params?: Record<string, number> } | null {
    if (!ctrl.touched || !ctrl.errors) return null;
    const e = ctrl.errors;
    if (e['required']) return { key: 'contact.form.errors.required' };
    if (ctrl === this.form.controls.email && e['pattern']) return { key: 'contact.form.errors.email' };
    if (e['pattern']) return { key: 'contact.form.errors.pattern' };
    if (e['minlength']) return { key: 'contact.form.errors.minlength', params: { n: e['minlength'].requiredLength } };
    if (e['maxlength']) return { key: 'contact.form.errors.maxlength', params: { n: e['maxlength'].requiredLength } };
    return null;
  }

  protected async submit(): Promise<void> {
    if (this.status() === 'sending') return;
    this.form.markAllAsTouched();
    // garante que validadores "on blur" correm também com Enter
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      document.querySelector<HTMLElement>('.contact-form [aria-invalid="true"]')?.focus();
      return;
    }

    const { website, ...msg } = this.form.getRawValue();
    if (website) {
      // bot: finge sucesso e não envia nada
      this.status.set('success');
      return;
    }
    if (Date.now() - this.startedAt < MIN_FILL_TIME) {
      this.status.set('too-fast');
      return;
    }

    this.status.set('sending');
    const result = await this.contact.send(msg, this.i18n.lang());
    this.status.set(result === 'ok' ? 'success' : result);
    if (result === 'ok') {
      this.form.reset();
      this.scroll.contactSubject.set(null);
    }
  }

  protected reset(): void {
    this.status.set('idle');
  }
}
