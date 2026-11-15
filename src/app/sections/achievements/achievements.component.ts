import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ACHIEVEMENT_PHOTOS } from '../../data/content';
import { PhotoRotatorComponent } from '../../shared/photo-rotator/photo-rotator.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

interface Achievement {
  year: string;
  title: string;
  detail: string;
}

/** Ecrãs horizontais ≥ 1024px (desktop e tablet deitado): linha clicável + galeria. */
const INTERACTIVE_QUERY = '(orientation: landscape) and (min-width: 1024px)';

/**
 * Conquistas: linha cronológica (mais recente → mais antiga).
 * Desktop / tablet deitado: clicar numa entrada ativa-a (só muda cor, nada se mexe)
 * e a galeria mostra as fotos dela a rodar (3,5s). Tablet em pé e mobile: só lista.
 */
@Component({
  selector: 'app-achievements',
  imports: [NgTemplateOutlet, TranslatePipe, PhotoRotatorComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './achievements.component.html',
  styleUrl: './achievements.component.scss',
})
export class AchievementsComponent {
  private readonly i18n = inject(I18nService);

  protected readonly items = computed(() => this.i18n.get<Achievement[]>('achievements.items'));
  protected readonly active = signal(0);
  protected readonly activePhotos = computed(() => ACHIEVEMENT_PHOTOS[this.active()] ?? []);
  protected readonly activeTitle = computed(() => this.items()[this.active()]?.title ?? '');

  protected readonly interactive = signal(false);

  constructor() {
    const mq = window.matchMedia(INTERACTIVE_QUERY);
    this.interactive.set(mq.matches);
    const onChange = (e: MediaQueryListEvent) => this.interactive.set(e.matches);
    mq.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => mq.removeEventListener('change', onChange));
  }

  protected select(i: number): void {
    this.active.set(i);
  }
}
