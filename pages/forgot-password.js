import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import MarketingShell from '@/components/marketing/MarketingShell';
import { useForgotPassword } from '@/hooks/auth/useAuthRecovery';
import { AppApiError } from '@/lib/api-error';

function toMessage(err, fallback) {
  if (err instanceof AppApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function ForgotPasswordPage() {
  const forgotM = useForgotPassword();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await forgotM.mutateAsync(email.trim());
      setMsg('If the email exists, a reset link has been sent.');
    } catch (error) {
      setErr(toMessage(error, 'Could not request password reset.'));
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password</title>
      </Head>
      <MarketingShell maxWidthClass="max-w-md" headerMode="auth">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-xl font-semibold text-white">Forgot password</h1>
          <p className="mt-2 text-sm text-slate-400">Request a reset link via `/auth/forgot-password`.</p>

          {msg ? <div className="mt-4 rounded bg-emerald-950/40 p-3 text-sm text-emerald-200">{msg}</div> : null}
          {err ? <div className="mt-4 rounded bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded border border-slate-700 bg-slate-950 px-3 text-sm text-white"
            />
            <button
              type="submit"
              disabled={forgotM.isPending}
              className="w-full rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {forgotM.isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            Back to <Link href="/login" className="text-orange-400">Sign in</Link>
          </p>
        </div>
      </MarketingShell>
    </>
  );
}
