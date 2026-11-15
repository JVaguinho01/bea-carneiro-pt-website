import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { ScrollService } from '../../core/services/scroll.service';
import { HERO_PHOTOS } from '../../data/content';
import { IconComponent } from '../../shared/icons/icon.component';
import { PhotoRotatorComponent } from '../../shared/photo-rotator/photo-rotator.component';

/** Mancha de luz difusa no fundo do hero. */
interface Spot {
  x: number; // % da largura
  y: number; // % da altura
  size: number; // px
  color: string; // variável CSS do tema
  dx: number; // deriva (px)
  dy: number;
  dur: number; // s
  delay: number; // s
}

const SPOT_COLORS = ['var(--spot-coral)', 'var(--spot-green)', 'var(--spot-peach)'];
const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Hero: título revela palavra a palavra, fotos de treino a rodar (4s), chips fixos
 * sobre a foto e manchas de luz suaves espalhadas ao acaso por trás (derivam devagar;
 * paradas com "reduzir movimento"). Sem indicador de scroll: a foto passa a dobra do
 * ecrã e dissolve-se num fade.
 */
@Component({
  selector: 'app-hero',
  imports: [TranslatePipe, IconComponent, PhotoRotatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  protected readonly scroll = inject(ScrollService);
  private readonly i18n = inject(I18nService);
  protected readonly photos = HERO_PHOTOS;

  protected readonly titleWords = computed(() => this.i18n.t('hero.title').split(' '));

  /** 3 a 5 manchas (ao acaso) espalhadas por todo o hero; podem ficar por trás da foto. */
  protected readonly spots: Spot[] = makeSpots();
}

function makeSpots(): Spot[] {
  const count = 3 + Math.floor(Math.random() * 3); // 3, 4 ou 5
  const colors = [...SPOT_COLORS].sort(() => Math.random() - 0.5);
  const spots: Spot[] = [];
  for (let i = 0; i < count; i++) {
    // escolhe a posição mais afastada das manchas já colocadas (entre 12 candidatas),
    // para ficarem espalhadas pelo ecrã todo e não amontoadas
    let best = { x: 50, y: 50 };
    let bestDist = -1;
    for (let c = 0; c < 12; c++) {
      const cand = { x: rand(5, 95), y: rand(8, 92) };
      const d = spots.length ? Math.min(...spots.map(p => Math.hypot(p.x - cand.x, p.y - cand.y))) : 1;
      if (d > bestDist) {
        bestDist = d;
        best = cand;
      }
    }
    spots.push({
      ...best,
      size: rand(320, 620),
      color: colors[i % colors.length],
      dx: rand(-70, 70),
      dy: rand(-60, 60),
      dur: rand(14, 24),
      delay: -rand(0, 20),
    });
  }
  return spots;
}
