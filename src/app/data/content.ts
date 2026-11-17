import { Photo, PhotoMeta } from './photo.model';
import { PHOTOS } from './photos.generated';

export const ACHIEVEMENT_FOLDERS = [
  '2025-world-games-bronze',
  '2025-europeu-prata',
  '2024-25-treinadora-campeoes-nacionais',
  '2024-taca-do-mundo-ouro',
  '2022-world-games-prata',
  '2022-mundial-prata',
  '2020-taca-do-mundo-prata',
  '2018-mundial-junior-ouro',
  '2017-europeu-junior-3-ouros',
];

function toPhoto(folder: string, meta: PhotoMeta, altKey: string, focus?: string, achievement?: number): Photo {
  return {
    ...meta,
    src: `images/${folder}/${meta.id}.webp`,
    srcSm: `images/${folder}/${meta.id}-sm.webp`,
    altKey,
    focus,
    achievement,
  };
}

function folder(name: string, altKey: (i: number) => string, focus?: string): Photo[] {
  return (PHOTOS[name] ?? []).map((meta, i) => toPhoto(name, meta, altKey(i), focus));
}

const indexedAlt = (key: string, count: number, fallback: string) => (i: number) => (i < count ? `${key}.${i}` : fallback);

export const HERO_PHOTOS = folder('inicio', indexedAlt('hero.photos', 4, 'gallery.alt.treinos'), '50% 40%');

export const ABOUT_PHOTOS = folder('sobre-mim', indexedAlt('about.photos', 4, 'gallery.alt.sobreMim'), '50% 30%');

const servicePhoto = (id: string, altKey: string) => {
  const meta = PHOTOS['servicos']?.find(p => p.id === id);
  return meta ? toPhoto('servicos', meta, altKey, '50% 40%') : null;
};
export const SERVICE_PHOTOS: Record<string, Photo | null> = {
  workshops: servicePhoto('servicos-workshops', 'services.items.0.photoAlt'),
  personalizado: servicePhoto('servicos-personalizado', 'services.items.1.photoAlt'),
  online: servicePhoto('servicos-online', 'services.items.2.photoAlt'),
};

export const ACHIEVEMENT_PHOTOS: Photo[][] = ACHIEVEMENT_FOLDERS.map((slug, i) =>
  (PHOTOS[`conquistas/${slug}`] ?? []).map(meta => toPhoto(`conquistas/${slug}`, meta, 'achievements.photoAlt', '50% 35%', i)),
);

export const INSTAGRAM_PHOTOS = folder('pessoais', () => 'instagram.alt', '50% 35%');

const pools = [...ACHIEVEMENT_PHOTOS, folder('treinos', () => 'gallery.alt.treinos')];
const interleaved: Photo[] = [];
for (let i = 0; pools.some(p => i < p.length); i++) {
  for (const pool of pools) if (pool[i]) interleaved.push(pool[i]);
}
export const GALLERY_PHOTOS: Photo[] = interleaved;
