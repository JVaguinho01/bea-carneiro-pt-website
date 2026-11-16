import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { SITE } from '../../core/config/site.config';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { MotionService } from '../../core/services/motion.service';
import { ScrollService } from '../../core/services/scroll.service';
import { ABOUT_PHOTOS } from '../../data/content';
import { IconComponent } from '../../shared/icons/icon.component';
import { PhotoRotatorComponent } from '../../shared/photo-rotator/photo-rotator.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

@Component({
  selector: 'app-about',
  imports: [TranslatePipe, IconComponent, PhotoRotatorComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly scroll = inject(ScrollService);
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  protected readonly photos = ABOUT_PHOTOS;
  protected readonly cvUrl = SITE.cvUrl;

  protected readonly words = computed(() => {
    const strong = this.i18n.t('about.statementStrong').split(' ');
    const muted = this.i18n.t('about.statementMuted').split(' ');
    return [...strong, ...muted];
  });
  protected readonly strongCount = computed(() => this.i18n.t('about.statementStrong').split(' ').length);
  protected readonly painted = signal(0);

  protected readonly stats = computed(() => this.i18n.get<Stat[]>('about.stats'));
  protected readonly counts = signal<number[] | null>(null);

  private readonly statement = viewChild.required<ElementRef<HTMLElement>>('statement');
  private readonly statsEl = viewChild.required<ElementRef<HTMLElement>>('statsEl');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = window;
      if (this.motion.reduced()) {
        this.painted.set(Number.MAX_SAFE_INTEGER);
        this.counts.set(null);
        return;
      }

      const el = this.statement().nativeElement;
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const vh = win.innerHeight;
        const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)));
        this.painted.set(Math.round(progress * (this.words().length - this.strongCount())));
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      update();

      this.counts.set(this.stats().map(() => 0));
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const targets = this.stats().map(s => s.value);
        const start = performance.now();
        const dur = 1200;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          this.counts.set(targets.map(v => Math.round(v * eased)));
          if (t < 1) requestAnimationFrame(tick);
          else this.counts.set(null);
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.6 });
      io.observe(this.statsEl().nativeElement);

      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        io.disconnect();
        cancelAnimationFrame(raf);
      });
    });
  }
}
