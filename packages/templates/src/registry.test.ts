import { describe, expect, it } from 'vitest';
import { getTemplate, templatesFor } from './registry';

describe('registry', () => {
  it('encuentra plantillas por id', () => {
    expect(getTemplate('yt-versiculo')?.name).toBe('Versículo');
    expect(getTemplate('no-existe')).toBeUndefined();
  });
  it('filtra por formato', () => {
    expect(templatesFor('yt-thumb').map((t) => t.id)).toEqual(['yt-impacto', 'yt-versiculo']);
    expect(templatesFor('ig-post').map((t) => t.id)).toEqual(['ig-evento', 'ig-cita']);
    expect(templatesFor('ig-carousel').map((t) => t.id)).toEqual(['ig-ruta']);
  });
});
