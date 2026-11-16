import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SITE } from '../../core/config/site.config';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { IconComponent } from '../icons/icon.component';
import { IconName } from '../icons/icons';

interface Channel {
  icon: IconName;
  href: string;
  labelKey: string;
  external: boolean;
}

@Component({
  selector: 'app-social-links',
  imports: [TranslatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-dark]': 'tone() === "dark"' },
  template: `
    <ul class="list">
      @for (c of channels; track c.icon) {
        <li>
          <a
            class="icon-btn"
            [href]="c.href"
            [attr.target]="c.external ? '_blank' : null"
            [attr.rel]="c.external ? 'noopener noreferrer' : null"
            [attr.aria-label]="(c.labelKey | t) + (c.external ? ' ' + ('common.newTab' | t) : '')"
          >
            <app-icon [name]="c.icon" />
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    .list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }
    :host(.is-dark) .icon-btn {
      border-color: var(--text-inverse-secondary);
      color: var(--text-inverse);
    }
    @media (hover: hover) and (pointer: fine) {
      :host(.is-dark) .icon-btn:hover {
        background: var(--text-inverse);
        color: var(--text-primary);
      }
    }
  `,
})
export class SocialLinksComponent {
  readonly tone = input<'light' | 'dark'>('light');

  protected readonly channels: Channel[] = [
    { icon: 'instagram', href: SITE.instagramUrl, labelKey: 'contact.channels.instagram', external: true },
    { icon: 'mail', href: `mailto:${SITE.email}`, labelKey: 'contact.channels.email', external: false },
    { icon: 'phone', href: `tel:${SITE.phoneE164}`, labelKey: 'contact.channels.phone', external: false },
    { icon: 'whatsapp', href: SITE.whatsappUrl, labelKey: 'contact.channels.whatsapp', external: true },
  ];
}
