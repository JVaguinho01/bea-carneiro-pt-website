import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';

/**
 * Uso: {{ 'hero.title' | t }}  ou  {{ 'common.photoOf' | t: { n: 1, total: 4 } }}
 * Impuro para reagir à troca de língua (a leitura é barata: lookup num objeto).
 */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
