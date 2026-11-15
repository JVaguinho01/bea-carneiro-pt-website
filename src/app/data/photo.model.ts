/** Metadados de uma foto em public/images/<categoria>/<id>.webp (+ <id>-sm.webp). */
export interface PhotoMeta {
  id: string;
  w: number;
  h: number;
}

/** Foto pronta a usar num componente. */
export interface Photo extends PhotoMeta {
  src: string;
  srcSm: string;
  /** Chave de tradução do texto alternativo. */
  altKey: string;
  /** Ponto de foco (object-position), ex.: "50% 30%". */
  focus?: string;
}
