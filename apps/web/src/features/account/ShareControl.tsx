import { useState } from 'react';
import { es } from '../../i18n/es';
import { shareUrl } from '../cloud/share';

interface Props {
  designId: string;
  isPublic: boolean;
  onChange: (id: string, next: boolean) => Promise<void>;
}

export function ShareControl({ designId, isPublic, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<'copied' | 'error' | null>(null);

  async function toggle(next: boolean) {
    setBusy(true);
    setMsg(null);
    try {
      await onChange(designId, next);
    } catch {
      setMsg('error');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl(designId));
      setMsg('copied');
    } catch {
      // Sin permiso de portapapeles: la persona puede copiar el campo a mano.
      document.getElementById(`share-${designId}`)?.focus();
    }
  }

  if (!isPublic) {
    return (
      <div className="mt-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void toggle(true)}
          className="rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-black/15 hover:bg-black/5 disabled:opacity-60"
        >
          {busy ? es.export.working : es.share.button}
        </button>
        <p role="alert" className="mt-1 text-sm text-red-700">{msg === 'error' ? es.share.error : ''}</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md bg-neutral-100 p-3 text-sm ring-1 ring-neutral-300">
      <label htmlFor={`share-${designId}`} className="block font-medium">{es.share.linkLabel}</label>
      <div className="flex gap-2">
        <input
          id={`share-${designId}`}
          readOnly
          value={shareUrl(designId)}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-black/15 bg-white px-2 py-1.5"
        />
        <button type="button" onClick={() => void copy()} className="rounded-full bg-black px-3 py-1.5 font-medium text-white hover:bg-neutral-800">
          {es.share.copy}
        </button>
      </div>
      <p className="text-xs text-black/70">{es.share.publicNote}</p>
      <button type="button" disabled={busy} onClick={() => void toggle(false)} className="text-sm font-medium text-red-700 underline disabled:opacity-60">
        {es.share.stop}
      </button>
      <p role="status" aria-live="polite" className="text-xs">
        {msg === 'copied' && es.share.copied}
        {msg === 'error' && <span className="text-red-700">{es.share.error}</span>}
      </p>
    </div>
  );
}
