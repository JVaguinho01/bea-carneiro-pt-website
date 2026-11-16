export interface PhotoMeta {
  id: string;
  w: number;
  h: number;
}

export interface Photo extends PhotoMeta {
  src: string;
  srcSm: string;
  altKey: string;
  focus?: string;
}
