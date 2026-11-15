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

const SPOT_COLORS = ['var(--spot-coral)', 'var(--spot-green)', 'var(--spot-ivory)'];
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

  /** 6 manchas em posições, tamanhos e cores ao acaso (mudam a cada visita). */
  protected readonly spots: Spot[] = Array.from({ length: 6 }, (_, i) => ({
    // espalha pelo ecrã: 3 colunas × 2 linhas, com variação dentro de cada zona
    x: (i % 3) * 33 + rand(4, 29),
    y: Math.floor(i / 3) * 50 + rand(5, 45),
    size: rand(260, 560),
    color: SPOT_COLORS[i % SPOT_COLORS.length],
    dx: rand(-60, 60),
    dy: rand(-50, 50),
    dur: rand(14, 24),
    delay: -rand(0, 20),
  }));
}
