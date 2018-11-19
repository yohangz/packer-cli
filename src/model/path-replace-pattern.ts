export interface PathReplacePattern {
  include: string[] | string;
  exclude?: string[] | string;
  replace?: string;
  test?: string;
  text?: string;
  file?: string;
  transform?: (code: string, id: string) => string;
}
