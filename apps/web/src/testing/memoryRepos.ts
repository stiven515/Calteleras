import type { Design } from '@cartelera/core';

export { memoryRepos } from '../features/storage/memoryRepos';

export const aDesign = (id: string, updatedAt: number, over: Partial<Design> = {}): Design => ({
  v: 1,
  id,
  title: id,
  templateId: 'yt-impacto',
  formatId: 'yt-thumb',
  values: {},
  palette: { bg: '#000000', fg: '#ffffff', accent: '#ff0000', muted: '#999999' },
  fonts: { heading: 'A', body: 'B' },
  updatedAt,
  ...over,
});
