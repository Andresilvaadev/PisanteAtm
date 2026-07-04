const MAP: Record<string, string> = {
  ç:'c', ã:'a', â:'a', á:'a', à:'a', ä:'a',
  é:'e', ê:'e', è:'e', ë:'e',
  í:'i', î:'i', ì:'i', ï:'i',
  ó:'o', ô:'o', õ:'o', ò:'o', ö:'o',
  ú:'u', û:'u', ù:'u', ü:'u',
  ñ:'n',
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çãâáàäéêèëíîìïóôõòöúûùüñ]/g, (c) => MAP[c] ?? c)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}
