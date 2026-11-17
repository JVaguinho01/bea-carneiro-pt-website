import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { Consent, PreferencesService } from '../../core/services/preferences.service';
import { IconComponent } from '../icons/icon.component';

@Component({
  selector: 'app-consent-card',
  imports: [TranslatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (prefs.cardOpen() || leaving()) {
      <section
        class="card"
        [class.is-leaving]="leaving()"
        [class.is-first]="prefs.consent() === null"
        role="region"
        aria-labelledby="consent-title"
        (animationend)="onAnimationEnd()"
      >
        <div class="head">
          <app-icon name="cookie" [size]="20" />
          <h2 id="consent-title" class="title">{{ 'consent.title' | t }}</h2>
        </div>
        <p class="text">{{ 'consent.text' | t }}</p>
        <div class="actions">
          <button type="button" class="btn btn--primary" (click)="decide('granted')">{{ 'consent.accept' | t }}</button>
          <button type="button" class="btn btn--outline" (click)="decide('denied')">{{ 'consent.decline' | t }}</button>
        </div>
      </section>
    }
  `,
  styles: `
    .card {
      position: fixed;
      left: max(24px, env(safe-area-inset-left));
      bottom: max(24px, env(safe-area-inset-bottom));
      z-index: var(--z-consent);
      width: 380px;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-lg);
      background: var(--bg-elevated);
      color: var(--text-primary);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-panel);
      animation: consent-in 450ms var(--ease-out) both;
    }
    .card.is-first {
      animation-delay: 800ms;
    }
    .card.is-leaving {
      animation: consent-out 250ms ease-in both;
    }
    .head {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      color: var(--text-brand);
    }
    .title {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: var(--fs-body-lg);
      line-height: 1.3;
      color: var(--text-primary);
    }
    .text {
      font-size: var(--fs-small);
      line-height: 1.5;
      color: var(--text-secondary);
    }
    .actions {
      display: flex;
      gap: var(--space-xs);
      margin-top: var(--space-2xs);
    }
    .actions .btn {
      flex: 1;
      padding-inline: var(--space-md);
    }
    @media (max-width: 767.98px) {
      .card {
        left: 12px;
        right: 12px;
        bottom: max(12px, env(safe-area-inset-bottom));
        width: auto;
        padding: var(--space-md);
      }
    }
    @keyframes consent-in {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
    }
    @keyframes consent-out {
      to {
        opacity: 0;
        transform: translateY(16px);
      }
    }
  `,
})
export class ConsentCardComponent {
  protected readonly prefs = inject(PreferencesService);
  protected readonly leaving = signal(false);

  protected decide(consent: Consent): void {
    this.prefs.decide(consent);
    this.leaving.set(true);
  }

  protected onAnimationEnd(): void {
    if (this.leaving()) this.leaving.set(false);
  }
}
