import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MarketingShell from '../components/marketing/MarketingShell';
import { useResetPassword } from '@/hooks/auth/useAuthRecovery';
import { AppApiError } from '@/lib/api-error';

function toMessage(err, fallback) {
  if (err instanceof AppApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetM = useResetPassword();
  const token = useMemo(
    () => (typeof router.query.token === 'string' ? router.query.token : ''),
    [router.query.token],
  );
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!token) {
      setErr('Missing reset token. Open this page from the email link.');
      return;
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    try {
      await resetM.mutateAsync({ token, password });
      setMsg('Password reset successful. You can now sign in.');
    } catch (error) {
      setErr(toMessage(error, 'Could not reset password.'));
    }
  };

  return (
    <>
      <Head><title>Reset Password</title></Head>
      <MarketingShell maxWidthClass="max-w-md" headerMode="auth">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-xl font-semibold text-white">Reset password</h1>
          <p className="mt-2 text-sm text-slate-400">Submit new password to `/auth/reset-password`.</p>
          {msg ? <div className="mt-4 rounded bg-emerald-950/40 p-3 text-sm text-emerald-200">{msg}</div> : null}
          {err ? <div className="mt-4 rounded bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="h-10 w-full rounded border border-slate-700 bg-slate-950 px-3 text-sm text-white"
            />
            <button
              type="submit"
              disabled={resetM.isPending}
              className="w-full rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {resetM.isPending ? 'Resetting…' : 'Reset password'}
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
