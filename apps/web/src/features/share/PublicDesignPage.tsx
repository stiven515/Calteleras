import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FORMATS, canvasSize } from '@cartelera/core';
import { getTemplate } from '@cartelera/templates';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';
import { cloudEnabled } from '../cloud/client';
import { fetchPublicDesign, publicAssetUrl, type PublicDesign } from '../cloud/share';
import { PreviewStage } from '../editor/PreviewStage';
import { assetIdsInValues } from '../storage/assetIds';
import { useStorage } from '../storage/storageStore';

type State = 'loading' | 'notfound' | 'error' | 'ready';

export function PublicDesignPage() {
  const { designId = '' } = useParams();
  const navigate = useNavigate();
  const repos = useStorage((s) => s.repos);
  const [state, setState] = useState<State>('loading');
  const [data, setData] = useState<PublicDesign | null>(null);
  const [copying, setCopying] = useState(false);
  useDocumentTitle(data?.design.title ?? es.share.pageTitle);

  useEffect(() => {
    if (!cloudEnabled) return setState('notfound');
    let cancelled = false;
    fetchPublicDesign(designId)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setState(d ? 'ready' : 'notfound');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
    };
  }, [designId]);

  if (state === 'loading') return <main className="p-8 text-black/60">{es.account.loading}</main>;
  if (state !== 'ready' || !data) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-bold">{state === 'error' ? es.share.errorTitle : es.share.notFoundTitle}</h1>
        <p className="mt-3 text-black/70">{state === 'error' ? es.share.errorText : es.share.notFoundText}</p>
        <Link to="/crear" className="mt-6 inline-block text-black underline">{es.home.cta}</Link>
      </main>
    );
  }

  const { design, ownerId } = data;
  const template = getTemplate(design.templateId);
  const format = FORMATS[design.formatId];
  const canvas = canvasSize(format, design.slides);
  const assetIds = assetIdsInValues(design.values);
  const assets = Object.fromEntries(assetIds.map((id) => [id, publicAssetUrl(ownerId, id)]));

  /** Copia el diseño (y sus imágenes) al dispositivo de quien lo ve, para editarlo como propio. */
  async function useAsBase() {
    if (!repos) return;
    setCopying(true);
    try {
      for (const id of assetIds) {
        const res = await fetch(assets[id]!).catch(() => null);
        if (res?.ok) await repos.assets.put(id, await res.blob());
      }
      const copy = { ...design, id: crypto.randomUUID(), title: `${design.title} ${es.account.copySuffix}`, updatedAt: Date.now() };
      await repos.designs.put(copy);
      navigate(`/editor/${copy.templateId}/${copy.id}`);
    } finally {
      setCopying(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{design.title}</h1>
      <p className="mt-1 text-black/60">{format.label}</p>
      <div className="mt-6">
        {template ? (
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
        ) : (
          <p>{es.share.noTemplate}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => void useAsBase()}
        disabled={copying || !repos || !template}
        className="mt-8 rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {copying ? es.export.working : es.share.useAsBase}
      </button>
      <p className="mt-2 text-sm text-black/60">{es.share.useAsBaseHelp}</p>
    </main>
  );
}
