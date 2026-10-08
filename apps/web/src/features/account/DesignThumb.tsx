import { useEffect, useState } from 'react';
import { FORMATS, canvasSize, type Design } from '@cartelera/core';
import { getTemplate } from '@cartelera/templates';
import { assetIdsOf } from '../editor/design';
import { PreviewStage } from '../editor/PreviewStage';
import { resolveAssetUrls } from '../storage/assets';

/** Miniatura viva de un diseño guardado (la plantilla dibujada con sus datos). */
export function DesignThumb({ design }: { design: Design }) {
  const template = getTemplate(design.templateId);
  const [assets, setAssets] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!template) return;
    let cancelled = false;
    void resolveAssetUrls(assetIdsOf(design, template)).then((a) => !cancelled && setAssets(a));
    return () => {
      cancelled = true;
    };
  }, [design, template]);

  if (!template) {
    return <div className="flex aspect-video items-center justify-center rounded-lg bg-black/5 text-sm">Plantilla no disponible</div>;
  }
  const format = FORMATS[design.formatId];
  const canvas = canvasSize(format, design.slides);
  return (
    <PreviewStage width={canvas.width} height={canvas.height}>
      <template.Component
        values={design.values}
        palette={design.palette}
        fonts={design.fonts}
        size={{ w: canvas.width, h: canvas.height }}
        slides={format.slides ? design.slides : undefined}
        slideWidth={format.slides ? format.width : undefined}
        assets={assets}
        mode="preview"
      />
    </PreviewStage>
  );
}
