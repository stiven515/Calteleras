import { beforeEach, describe, expect, it } from 'vitest';
import { ytImpacto } from '@cartelera/templates';
import { useEditor } from './stores/editorStore';

describe('editorStore', () => {
  beforeEach(() => useEditor.setState({ templateId: null, values: {}, palette: null, assets: {} }));

  it('carga los valores por defecto de la plantilla', () => {
    useEditor.getState().load(ytImpacto);
    expect(useEditor.getState().values.title).toBe(ytImpacto.defaults.title);
  });
  it('no pisa lo editado al recargar la misma plantilla', () => {
    const s = useEditor.getState();
    s.load(ytImpacto);
    s.setValue('title', 'Hola');
    s.load(ytImpacto);
    expect(useEditor.getState().values.title).toBe('Hola');
  });
  it('cambia un color de la paleta sin mutar el original', () => {
    useEditor.getState().load(ytImpacto);
    useEditor.getState().setColor('accent', '#ff0000');
    expect(useEditor.getState().palette?.accent).toBe('#ff0000');
    expect(ytImpacto.palette.accent).toBe('#ffc233');
  });
});
