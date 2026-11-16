import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const imagesDir = join(root, 'public', 'images');
const categories = ['retratos', 'competicao', 'treino', 'pessoal'];

function webpSize(file) {
  const b = readFileSync(file);
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
}

const photos = {};
for (const cat of categories) {
  const files = readdirSync(join(imagesDir, cat)).filter(f => f.endsWith('.webp') && !f.endsWith('-sm.webp')).sort();
  photos[cat] = files.map(f => {
    const { w, h } = webpSize(join(imagesDir, cat, f));
    return { id: f.replace('.webp', ''), w, h };
  });
}

const out = `import { PhotoMeta } from './photo.model';

export const PHOTOS: Record<'retratos' | 'competicao' | 'treino' | 'pessoal', PhotoMeta[]> = ${JSON.stringify(photos, null, 2)};
`;
writeFileSync(join(root, 'src', 'app', 'data', 'photos.generated.ts'), out);
console.log(Object.entries(photos).map(([k, v]) => `${k}: ${v.length}`).join(', '));
