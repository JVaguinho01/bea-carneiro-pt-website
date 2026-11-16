import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ContactService, SendResult } from '../../core/services/contact.service';
import { RecaptchaService } from '../../core/services/recaptcha.service';
import { ScrollService } from '../../core/services/scroll.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

type Status = 'idle' | 'sending' | 'success' | SendResult | 'too-fast' | 'captcha';

const MIN_FILL_TIME = 3000;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const NAME_RE = /^[\p{L}][\p{L} .'’-]*$/u;

const MAX_CHARS = 500;

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, TranslatePipe, IconComponent, RevealDirective],
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
  protected readonly maxChars = MAX_CHARS;
  protected readonly charCount = signal(0);
  protected onMessageInput(value: string): void {
    this.charCount.set(value.length);
  }

  private readonly recaptcha = inject(RecaptchaService);
  protected readonly captchaEnabled = this.recaptcha.enabled;
  private readonly captchaEl = viewChild<ElementRef<HTMLElement>>('captcha');
  protected readonly captchaToken = signal<string | null>(null);
  private captchaId: number | null = null;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(NAME_RE)], updateOn: 'blur' }],
    email: ['', { validators: [Validators.required, Validators.maxLength(120), Validators.pattern(EMAIL_RE)], updateOn: 'blur' }],
    subject: ['', { validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)], updateOn: 'blur' }],
    message: ['', { validators: [Validators.required, Validators.minLength(10), Validators.maxLength(MAX_CHARS)], updateOn: 'blur' }],
    website: [''],
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    let io: IntersectionObserver | undefined;
    effect(() => {
      const el = this.captchaEl()?.nativeElement;
      io?.disconnect();
      this.captchaId = null;
      this.captchaToken.set(null);
      if (!el || !this.captchaEnabled) return;
      io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io?.disconnect();
        this.recaptcha
          .render(el, t => {
            this.captchaToken.set(t);
            if (t && this.status() === 'captcha') this.status.set('idle');
          }, this.i18n.lang())
          .then(id => (this.captchaId = id))
          .catch(() => this.status.set('error'));
      }, { rootMargin: '400px 0px' });
      io.observe(el);
    });
    destroyRef.onDestroy(() => io?.disconnect());

    effect(() => {
      const subject = this.scroll.contactSubject();
      if (subject) {
        this.form.controls.subject.setValue(subject);
        if (this.status() === 'success') this.status.set('idle');
      }
    });
  }

  protected readonly showErrors = signal(false);
  private errorsTimer?: ReturnType<typeof setTimeout>;

  private flashErrors(): void {
    this.showErrors.set(true);
    clearTimeout(this.errorsTimer);
    this.errorsTimer = setTimeout(() => this.showErrors.set(false), 5000);
  }

  protected errorKey(ctrl: AbstractControl): { key: string; params?: Record<string, number> } | null {
    if (!this.showErrors() || !ctrl.errors) return null;
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

    if (this.captchaEnabled && !this.captchaToken()) {
      this.status.set('captcha');
      return;
    }

    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.status.set('idle');
      this.flashErrors();
      setTimeout(() => document.querySelector<HTMLElement>('.contact-form [aria-invalid="true"]')?.focus());
      return;
    }
    this.showErrors.set(false);

    const { website, ...msg } = this.form.getRawValue();
    if (website) {
      this.status.set('success');
      return;
    }
    if (Date.now() - this.startedAt < MIN_FILL_TIME) {
      this.status.set('too-fast');
      return;
    }

    this.status.set('sending');
    const result = await this.contact.send(msg, this.i18n.lang(), this.captchaToken());
    if (result !== 'ok') {
      this.recaptcha.reset(this.captchaId);
      this.captchaToken.set(null);
    }
    this.status.set(result === 'ok' ? 'success' : result);
    if (result === 'ok') {
      this.form.reset();
      this.charCount.set(0);
      this.scroll.contactSubject.set(null);
    }
  }

  protected reset(): void {
    this.status.set('idle');
  }
}
