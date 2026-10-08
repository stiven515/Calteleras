import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

export type ExportFormat = 'png' | 'jpg';

export const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
};

export function exportFilename(base: string, ext: ExportFormat, index?: number): string {
  const safe = base.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diseno';
  return index === undefined ? `${safe}.${ext}` : `${String(index + 1).padStart(2, '0')}.${ext}`;
}

/** Espera fuentes y decodifica todas las imágenes antes de capturar. */
export async function waitForAssets(root: HTMLElement): Promise<void> {
  await document.fonts.ready;
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
  // Margen para que AutoFitText termine de recalcular tras cargar fuentes. Se usa setTimeout y no
  // requestAnimationFrame: rAF no se dispara en pestañas ocultas y la exportación se colgaría.
  await new Promise<void>((r) => setTimeout(r, 60));
}

interface RenderOptions {
  element: ReactElement;
  width: number;
  height: number;
  format: ExportFormat;
  /** Fondo opaco (obligatorio en JPG). */
  background: string;
  quality?: number;
}

/**
 * Monta la plantilla fuera de pantalla a tamaño real (sin transform: scale)
 * y la captura a Blob. Desmonta siempre, incluso si falla.
 */
export async function renderToBlob(opts: RenderOptions): Promise<Blob> {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${opts.width}px;height:${opts.height}px;pointer-events:none;`;
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(opts.element));
    await waitForAssets(host);
    // Se carga solo al exportar: la librería pesa y no hace falta para editar.
    const { domToBlob } = await import('modern-screenshot');
    const blob = await domToBlob(host, {
      width: opts.width,
      height: opts.height,
      scale: 1,
      type: MIME[opts.format],
      quality: opts.quality ?? 0.92,
      backgroundColor: opts.background,
    });
    if (!blob) throw new Error('No se pudo generar la imagen');
    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
