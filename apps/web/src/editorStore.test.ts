import { beforeEach, describe, expect, it } from 'vitest';
import { igRuta, ytImpacto } from '@cartelera/templates';
import { useEditor } from './stores/editorStore';

const reset = () =>
  useEditor.setState({ designId: null, templateId: null, title: '', values: {}, palette: null, fonts: null, assets: {}, dirty: false, slides: 1 });

describe('editorStore', () => {
  beforeEach(reset);

  it('startNew carga los valores por defecto y un id nuevo, sin marcar cambios', () => {
    useEditor.getState().startNew(ytImpacto);
    const s = useEditor.getState();
    expect(s.values.title).toBe(ytImpacto.defaults.title);
    expect(s.designId).toBeTruthy();
    expect(s.dirty).toBe(false);
  });
  it('cada startNew crea un diseño distinto', () => {
    useEditor.getState().startNew(ytImpacto);
    const a = useEditor.getState().designId;
    useEditor.getState().startNew(ytImpacto);
    expect(useEditor.getState().designId).not.toBe(a);
  });
  it('editar marca cambios pendientes; markSaved los limpia', () => {
    useEditor.getState().startNew(ytImpacto);
    useEditor.getState().setValue('title', 'Hola');
    expect(useEditor.getState().dirty).toBe(true);
    useEditor.getState().markSaved();
    expect(useEditor.getState().dirty).toBe(false);
  });
  it('cambia un color de la paleta sin mutar el original', () => {
    useEditor.getState().startNew(ytImpacto);
    useEditor.getState().setColor('accent', '#ff0000');
    expect(useEditor.getState().palette?.accent).toBe('#ff0000');
    expect(ytImpacto.palette.accent).toBe('#ffc233');
  });
  it('la vista de zonas seguras empieza oculta y se puede cambiar', () => {
    expect(useEditor.getState().safeView).toBeNull();
    useEditor.getState().setSafeView('mobile');
    expect(useEditor.getState().safeView).toBe('mobile');
  });
  it('el carrusel carga con 4 imágenes y respeta los límites', () => {
    useEditor.getState().startNew(igRuta);
    expect(useEditor.getState().slides).toBe(4);
    useEditor.getState().setSlides(99);
    expect(useEditor.getState().slides).toBe(10);
    useEditor.getState().setSlides(0);
    expect(useEditor.getState().slides).toBe(2);
  });
  it('un formato sin carrusel queda en 1 imagen', () => {
    useEditor.getState().startNew(ytImpacto);
    useEditor.getState().setSlides(5);
    expect(useEditor.getState().slides).toBe(1);
  });
  it('hydrate restaura un diseño guardado', () => {
    useEditor.getState().hydrate(
      {
        v: 1, id: 'x', title: 'T', templateId: 'ig-ruta', formatId: 'ig-carousel',
        values: { title: 'A' }, palette: igRuta.palette, fonts: igRuta.fonts, slides: 6, updatedAt: 1,
      },
      { img: 'blob:1' },
    );
    const s = useEditor.getState();
    expect(s).toMatchObject({ designId: 'x', title: 'T', slides: 6, dirty: false });
    expect(s.assets.img).toBe('blob:1');
  });
  it('applyBrand cambia colores, fuentes y logo solo si la plantilla lo permite', () => {
    useEditor.getState().startNew(ytImpacto);
    const kit = {
      v: 1 as const, logoAssetId: 'logo1', updatedAt: 1,
      palette: { bg: '#111111', fg: '#eeeeee', accent: '#00ff00', muted: '#777777' },
      fonts: { heading: 'H', body: 'B' },
    };
    useEditor.getState().applyBrand(kit, 'logo');
    let s = useEditor.getState();
    expect(s.palette?.bg).toBe('#111111');
    expect(s.fonts?.heading).toBe('H');
    expect(s.values.logo).toBe('logo1');
    useEditor.getState().startNew(ytImpacto);
    useEditor.getState().applyBrand(kit, null);
    s = useEditor.getState();
    expect(s.values.logo).toBeNull(); // sin campo de logo indicado, el logo no se toca
  });
});
