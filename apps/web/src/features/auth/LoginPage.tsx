import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../app/useDocumentTitle';
import { es } from '../../i18n/es';
import { MIN_PASSWORD } from './messages';
import { useAuth } from './authStore';

const input =
  'w-full rounded-md border border-black/15 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-black';

export function LoginPage() {
  const { enabled, user, busy, error, notice, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  useDocumentTitle(es.auth.signIn);

  useEffect(() => {
    if (user) navigate('/cuenta', { replace: true });
  }, [user, navigate]);

  if (!enabled) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">{es.auth.disabledTitle}</h1>
        <p className="mt-3 text-black/70">{es.auth.disabledText}</p>
        <Link to="/crear" className="mt-6 inline-block text-black underline">{es.auth.keepLocal}</Link>
      </main>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void (mode === 'signin' ? signIn(email, password) : signUp(email, password));
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{mode === 'signin' ? es.auth.signInTitle : es.auth.signUpTitle}</h1>
      <p className="mt-2 text-black/70">{es.auth.benefit}</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">{es.auth.email}</label>
          <input id="email" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">{es.auth.password}</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={mode === 'signup' ? MIN_PASSWORD : undefined}
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'signup' && <p className="mt-1 text-xs text-black/60">{es.auth.passwordHint(MIN_PASSWORD)}</p>}
        </div>
        <div role="alert" aria-live="assertive">
          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
        </div>
        <div role="status" aria-live="polite">
          {notice && <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 ring-1 ring-emerald-200">{notice}</p>}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-black px-4 py-3 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {busy ? es.auth.working : mode === 'signin' ? es.auth.signIn : es.auth.signUp}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-sm text-black/50" aria-hidden="true">
        <span className="h-px flex-1 bg-black/10" />
        {es.auth.or}
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="w-full rounded-lg bg-white px-4 py-3 font-semibold ring-1 ring-black/20 hover:bg-black/5"
      >
        {es.auth.google}
      </button>

      <p className="mt-6 text-sm">
        {mode === 'signin' ? es.auth.noAccount : es.auth.haveAccount}{' '}
        <button type="button" className="font-semibold text-black underline" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? es.auth.signUp : es.auth.signIn}
        </button>
      </p>
    </main>
  );
}
