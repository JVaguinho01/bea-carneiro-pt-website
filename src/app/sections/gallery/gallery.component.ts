import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { GALLERY_PHOTOS } from '../../data/content';
import { Photo } from '../../data/photo.model';
import { IconComponent } from '../../shared/icons/icon.component';
import { OverlayComponent } from '../../shared/overlay/overlay.component';
import { RevealDirective } from '../../shared/reveal/reveal.directive';

function initialCount(): number {
  const w = window.innerWidth;
  if (w < 768) return 8;
  if (w < 1280 && !matchMedia('(orientation: landscape) and (min-width: 1024px)').matches) return 9;
  return 12;
}

function columnsFor(): number {
  const w = window.innerWidth;
  if (w < 768) return 2;
  if (w < 1280 && !matchMedia('(orientation: landscape) and (min-width: 1024px)').matches) return 3;
  return 4;
}

@Component({
  selector: 'app-gallery',
  imports: [TranslatePipe, IconComponent, OverlayComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  protected readonly all: Photo[] = GALLERY_PHOTOS;
  protected readonly shown = signal(initialCount());
  protected readonly visible = computed(() => this.all.slice(0, this.shown()));
  protected readonly batchStart = signal(0);

  protected readonly columnCount = signal(columnsFor());

  protected readonly columns = computed(() => {
    const n = this.columnCount();
    const cols: { photo: Photo; index: number }[][] = Array.from({ length: n }, () => []);
    const heights = new Array<number>(n).fill(0);
    this.visible().forEach((photo, index) => {
      const target = heights.indexOf(Math.min(...heights));
      cols[target].push({ photo, index });
      heights[target] += photo.h / photo.w;
    });
    return cols;
  });

  protected readonly viewerIndex = signal<number | null>(null);
  protected readonly viewerPhoto = computed(() => {
    const i = this.viewerIndex();
    return i === null ? null : this.all[i];
  });

  private touchX: number | null = null;

  constructor() {
    const onKey = (e: KeyboardEvent) => {
      if (this.viewerIndex() === null) return;
      if (e.key === 'ArrowRight') this.step(1);
      if (e.key === 'ArrowLeft') this.step(-1);
    };
    const onResize = () => this.columnCount.set(columnsFor());
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    });
  }

  protected readonly loadingMore = signal(false);

  protected async more(): Promise<void> {
    if (this.loadingMore()) return;
    const from = this.shown();
    const to = Math.min(this.all.length, from + 12);
    this.loadingMore.set(true);
    await Promise.all(
      this.all.slice(from, to).map(p => {
        const img = new Image();
        img.src = p.srcSm;
        return img.decode().catch(() => undefined);
      }),
    );
    this.batchStart.set(from);
    this.shown.set(to);
    this.loadingMore.set(false);
  }

  protected open(i: number): void {
    this.viewerIndex.set(i);
  }

  protected close(): void {
    this.viewerIndex.set(null);
  }

  protected step(delta: number): void {
    const i = this.viewerIndex();
    if (i === null) return;
    const n = this.all.length;
    this.viewerIndex.set((i + delta + n) % n);
  }

  protected categoryOf(p: Photo): string {
    return p.altKey.split('.').pop() ?? 'competicao';
  }

  protected onTouchStart(e: TouchEvent): void {
    this.touchX = e.touches[0]?.clientX ?? null;
  }

  protected onTouchEnd(e: TouchEvent): void {
    if (this.touchX === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? this.touchX) - this.touchX;
    this.touchX = null;
    if (Math.abs(dx) > 50) this.step(dx < 0 ? 1 : -1);
  }
}
