import { beforeEach, describe, expect, it } from 'vitest';
import { igRuta, ytImpacto } from '@cartelera/templates';
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
  it('la vista de zonas seguras empieza oculta y se puede cambiar', () => {
    expect(useEditor.getState().safeView).toBeNull();
    useEditor.getState().setSafeView('mobile');
    expect(useEditor.getState().safeView).toBe('mobile');
  });
  it('el carrusel carga con 4 imágenes y respeta los límites', () => {
    useEditor.getState().load(igRuta);
    expect(useEditor.getState().slides).toBe(4);
    useEditor.getState().setSlides(99);
    expect(useEditor.getState().slides).toBe(10);
    useEditor.getState().setSlides(0);
    expect(useEditor.getState().slides).toBe(2);
  });
  it('un formato sin carrusel queda en 1 imagen', () => {
    useEditor.getState().load(ytImpacto);
    useEditor.getState().setSlides(5);
    expect(useEditor.getState().slides).toBe(1);
  });
  it('cambia un color de la paleta sin mutar el original', () => {
    useEditor.getState().load(ytImpacto);
    useEditor.getState().setColor('accent', '#ff0000');
    expect(useEditor.getState().palette?.accent).toBe('#ff0000');
    expect(ytImpacto.palette.accent).toBe('#ffc233');
  });
});
