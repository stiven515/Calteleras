import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';
import { useAuth } from '../auth/authStore';
import { runSync, useCloud } from '../cloud/session';

const timeFmt = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

export function ProfilePage() {
  const { enabled, user, signOut } = useAuth();
  useDocumentTitle(es.nav.profile);
  const { status, lastSyncAt, errors } = useCloud();

  if (!enabled) {
    return <p className="max-w-xl text-black/70">{es.auth.disabledText}</p>;
  }
  if (!user) {
    return (
      <div className="max-w-xl rounded-xl bg-white p-6 ring-1 ring-black/10">
        <p>{es.profile.signedOut}</p>
        <Link to="/entrar" className="mt-4 inline-block rounded-full bg-black px-5 py-2.5 font-semibold text-white hover:bg-neutral-800">
          {es.auth.signIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <section className="rounded-xl bg-white p-6 ring-1 ring-black/10" aria-labelledby="prof-acc">
        <h2 id="prof-acc" className="text-lg font-semibold">{es.profile.account}</h2>
        <p className="mt-2 text-black/70">{user.email}</p>
        <button type="button" onClick={() => void signOut()} className="mt-4 rounded-md px-4 py-2 font-medium ring-1 ring-black/20 hover:bg-black/5">
          {es.profile.signOut}
        </button>
      </section>

      <section className="rounded-xl bg-white p-6 ring-1 ring-black/10" aria-labelledby="prof-sync">
        <h2 id="prof-sync" className="text-lg font-semibold">{es.profile.sync}</h2>
        <p role="status" aria-live="polite" className="mt-2 text-black/70">
          {status === 'syncing' && es.profile.syncing}
          {status === 'idle' && (lastSyncAt ? es.profile.syncedAt(timeFmt.format(lastSyncAt)) : es.profile.notSyncedYet)}
          {status === 'error' && es.profile.syncError}
        </p>
        {errors.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
            {errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
        <button
          type="button"
          onClick={() => void runSync()}
          disabled={status === 'syncing'}
          className="mt-4 rounded-full bg-black px-4 py-2 font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {es.profile.syncNow}
        </button>
      </section>
    </div>
  );
}
