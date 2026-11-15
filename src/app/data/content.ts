// =============================================================================
// Plano de fotos por secção (regra do Figma: cada foto aparece numa só secção;
// a Galeria junta todas as que sobram). Mudar uma foto = mudar o id aqui.
// =============================================================================
import { Photo, PhotoMeta } from './photo.model';
import { PHOTOS } from './photos.generated';

type Category = keyof typeof PHOTOS;

const ALL: Record<string, PhotoMeta & { category: Category }> = Object.fromEntries(
  (Object.keys(PHOTOS) as Category[]).flatMap(cat => PHOTOS[cat].map(p => [p.id, { ...p, category: cat }])),
);

const used = new Set<string>();

/** Monta uma foto a partir do id. Fotos que já não existem são ignoradas. */
function photo(id: string, altKey: string, focus?: string): Photo | null {
  const meta = ALL[id];
  if (!meta) return null;
  used.add(id);
  return {
    ...meta,
    src: `images/${meta.category}/${id}.webp`,
    srcSm: `images/${meta.category}/${id}-sm.webp`,
    altKey,
    focus,
  };
}

const list = (items: (Photo | null)[]) => items.filter((p): p is Photo => p !== null);

// ---- Hero: 4 fotos de TREINO (o que a pessoa vai ter) ------------------------
export const HERO_PHOTOS = list([
  photo('treino-01', 'hero.photos.0', '50% 40%'),
  photo('treino-02', 'hero.photos.1', '60% 50%'),
  photo('treino-03', 'hero.photos.2', '50% 30%'),
  photo('treino-13', 'hero.photos.3', '50% 35%'),
]);

// ---- Sobre mim: fotos DA BEATRIZ (retrato com medalhas primeiro) -------------
export const ABOUT_PHOTOS = list([
  photo('retratos-03', 'about.photos.0', '50% 30%'),
  photo('competicao-14', 'about.photos.1', '50% 30%'),
  photo('competicao-02', 'about.photos.2', '50% 30%'),
  photo('competicao-34', 'about.photos.3', '50% 30%'),
]);

// ---- Serviços: 1 foto própria por serviço ------------------------------------
export const SERVICE_PHOTOS: Record<string, Photo | null> = {
  workshops: photo('treino-10', 'services.items.0.photoAlt', '50% 40%'),
  personalizado: photo('treino-06', 'services.items.1.photoAlt', '50% 40%'),
  online: photo('treino-08', 'services.items.2.photoAlt', '50% 40%'),
};

// ---- Conquistas: fotos de cada entrada da linha cronológica (mesma ordem) -----
const ach = (ids: string[]) => list(ids.map(id => photo(id, 'achievements.photoAlt', '50% 35%')));
export const ACHIEVEMENT_PHOTOS: Photo[][] = [
  ach(['competicao-15', 'competicao-12', 'competicao-33']),
  ach(['competicao-24', 'competicao-25', 'competicao-26']),
  ach(['competicao-18', 'competicao-21', 'competicao-13']),
  ach(['competicao-27', 'competicao-28', 'competicao-08']),
  ach(['competicao-06', 'competicao-07', 'competicao-04']),
  ach(['competicao-03', 'competicao-09', 'competicao-11']),
  ach(['competicao-10', 'competicao-01', 'competicao-16']),
];

// ---- Instagram: TODAS as fotos pessoais (vão alternando, 4 de cada vez) ----------
export const INSTAGRAM_PHOTOS = list(PHOTOS.pessoal.map(p => photo(p.id, 'instagram.alt', '50% 35%')));

// ---- Galeria: só carreira (competição e treino) que sobram; nada pessoal ---------
// Os retratos e as fotos pessoais ficam de fora (a pedido do cliente).
function remaining(cat: Category): Photo[] {
  return list(PHOTOS[cat].filter(p => !used.has(p.id)).map(p => photo(p.id, `gallery.alt.${cat}`)));
}
const pools = [remaining('competicao'), remaining('treino')];
const interleaved: Photo[] = [];
for (let i = 0; pools.some(p => i < p.length); i++) {
  for (const pool of pools) if (pool[i]) interleaved.push(pool[i]);
}
export const GALLERY_PHOTOS: Photo[] = interleaved;
