import { useCallback, useEffect, useState } from 'react';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { Link } from 'react-router-dom';
import { FORMATS, type Design } from '@cartelera/core';
import { es } from '../../i18n/es';
import { useAuth } from '../auth/authStore';
import { scheduleSync } from '../cloud/session';
import { listPublicIds, setDesignPublic } from '../cloud/share';
import { ShareControl } from './ShareControl';
import { useStorage } from '../storage/storageStore';
import { DesignThumb } from './DesignThumb';

const dateFmt = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export function MyDesigns() {
  const repos = useStorage((s) => s.repos);
  const { enabled, ready, user } = useAuth();
  useDocumentTitle(es.nav.myDesigns);
  const [designs, setDesigns] = useState<Design[] | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (repos) setDesigns(await repos.designs.list());
  }, [repos]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Qué diseños están compartidos (solo con sesión). Si falla, simplemente no se muestran como compartidos.
  const [publicIds, setPublicIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!user) return setPublicIds(new Set());
    let cancelled = false;
    listPublicIds()
      .then((s) => !cancelled && setPublicIds(s))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function togglePublic(id: string, next: boolean) {
    await setDesignPublic(id, next);
    setPublicIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
  }

  async function duplicate(d: Design) {
    if (!repos) return;
    await repos.designs.put({ ...d, id: crypto.randomUUID(), title: `${d.title} ${es.account.copySuffix}`, updatedAt: Date.now() });
    scheduleSync();
    await reload();
  }

  async function remove(id: string) {
    if (!repos) return;
    await repos.designs.remove(id);
    await repos.tombstones.add(id); // para borrarlo también de la nube en la próxima sincronización
    setConfirming(null);
    scheduleSync();
    await reload();
  }

  if (!designs) return <p className="text-black/60">{es.account.loading}</p>;

  const guestBanner = enabled && ready && !user && (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-neutral-100 p-4 text-sm ring-1 ring-neutral-300">
      <p>{es.auth.guestBanner}</p>
      <Link to="/entrar" className="rounded-full bg-black px-4 py-2 font-medium text-white hover:bg-neutral-800">
        {es.auth.guestCta}
      </Link>
    </div>
  );

  if (designs.length === 0) {
    return (
      <>
        {guestBanner}
        <div className="rounded-xl bg-white p-8 text-center ring-1 ring-black/10">
        <p className="font-semibold">{es.account.emptyTitle}</p>
        <p className="mt-1 text-black/70">{es.account.emptyText}</p>
        <Link to="/crear" className="mt-5 inline-block rounded-full bg-black px-5 py-2.5 font-semibold text-white hover:bg-neutral-800">
          {es.home.cta}
        </Link>
        </div>
      </>
    );
  }

  return (
    <>
    {guestBanner}
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((d) => (
        <li key={d.id} className="min-w-0 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/10">
          <Link to={`/editor/${d.templateId}/${d.id}`} aria-label={es.account.open(d.title)} className="block focus:outline-none focus:ring-2 focus:ring-black">
            <DesignThumb design={d} />
          </Link>
          <h2 className="mt-3 truncate font-semibold">{d.title}</h2>
          <p className="text-xs text-black/60">
            {FORMATS[d.formatId].label} · {dateFmt.format(d.updatedAt)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Link to={`/editor/${d.templateId}/${d.id}`} className="rounded-full bg-black px-3 py-1.5 font-medium text-white hover:bg-neutral-800">
              {es.account.edit}
            </Link>
            <button type="button" onClick={() => void duplicate(d)} className="rounded-md px-3 py-1.5 font-medium ring-1 ring-black/15 hover:bg-black/5">
              {es.account.duplicate}
            </button>
            {confirming === d.id ? (
              <span role="alert" className="flex items-center gap-2">
                <span>{es.account.confirmDelete}</span>
                <button type="button" onClick={() => void remove(d.id)} className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white">
                  {es.account.yesDelete}
                </button>
                <button type="button" onClick={() => setConfirming(null)} className="rounded-md px-3 py-1.5 ring-1 ring-black/15">
                  {es.account.cancel}
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirming(d.id)} className="rounded-md px-3 py-1.5 font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50">
                {es.account.delete}
              </button>
            )}
          </div>
          {user && <ShareControl designId={d.id} isPublic={publicIds.has(d.id)} onChange={togglePublic} />}
        </li>
      ))}
    </ul>
    </>
  );
}
