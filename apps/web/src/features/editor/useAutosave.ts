import { useEffect, useRef, useState } from 'react';
import type { Design } from '@cartelera/core';
import type { TemplateDef } from '@cartelera/templates';
import { useEditor } from '../../stores/editorStore';
import { requireRepos } from '../storage/storageStore';
import { toDesign } from './design';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEBOUNCE_MS = 700;

/**
 * Guarda el diseño en el almacenamiento local pocos instantes después del último cambio,
 * y una vez más al salir del editor. Un diseño recién abierto sin editar no se guarda
 * (así no se llenan "Mis diseños" de piezas vacías).
 */
export function useAutosave(template: TemplateDef | undefined, onSaved?: (d: Design) => void): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (!template) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function flush() {
      const s = useEditor.getState();
      if (!s.dirty || !s.designId || !s.palette || !s.fonts || s.templateId !== template!.id) return;
      setStatus('saving');
      try {
        const design = toDesign(
          { designId: s.designId, title: s.title, values: s.values, palette: s.palette, fonts: s.fonts, slides: s.slides },
          template!,
        );
        await requireRepos().designs.put(design);
        // Si se editó algo mientras se guardaba, queda pendiente para el siguiente ciclo.
        if (useEditor.getState().values === s.values && useEditor.getState().palette === s.palette) {
          useEditor.getState().markSaved();
        }
        setStatus('saved');
        onSavedRef.current?.(design);
      } catch {
        setStatus('error');
      }
    }

    const unsubscribe = useEditor.subscribe((s, prev) => {
      if (!s.dirty || s === prev) return;
      clearTimeout(timer);
      timer = setTimeout(() => void flush(), DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
      void flush();
    };
  }, [template]);

  return status;
}
