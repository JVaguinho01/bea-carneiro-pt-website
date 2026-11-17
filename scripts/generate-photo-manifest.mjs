import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '..');
const imagesDir = join(root, 'public', 'images');

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
function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.webp') && !e.name.endsWith('-sm.webp')).map(e => e.name).sort();
  if (files.length) {
    photos[relative(imagesDir, dir).split('\\').join('/')] = files.map(f => {
      const { w, h } = webpSize(join(dir, f));
      return { id: f.replace('.webp', ''), w, h };
    });
  }
  for (const e of entries) if (e.isDirectory()) walk(join(dir, e.name));
}
walk(imagesDir);

const out = `import { PhotoMeta } from './photo.model';

export const PHOTOS: Record<string, PhotoMeta[]> = ${JSON.stringify(photos, null, 2)};
`;
writeFileSync(join(root, 'src', 'app', 'data', 'photos.generated.ts'), out);
console.log(Object.entries(photos).map(([k, v]) => `${k}: ${v.length}`).join(', '));
