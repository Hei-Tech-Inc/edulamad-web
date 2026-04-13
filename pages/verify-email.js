import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import MarketingShell from '../components/marketing/MarketingShell';
import {
  useResendVerification,
  useVerifyEmail,
} from '@/hooks/auth/useAuthRecovery';
import { AppApiError } from '@/lib/api-error';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { useAuthStore } from '@/stores/auth.store';

function toMessage(err, fallback) {
  if (err instanceof AppApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const verifyM = useVerifyEmail();
  const resendM = useResendVerification();
  const token = useMemo(
    () => (typeof router.query.token === 'string' ? router.query.token : ''),
    [router.query.token],
  );
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const mePoll = useQuery({
    queryKey: ['auth', 'me', 'verify-poll'],
    enabled: Boolean(accessToken),
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get(API.auth.me, { signal });
      return data;
    },
    refetchInterval: 5000,
    staleTime: 0,
  });

  useEffect(() => {
    const u = mePoll.data;
    if (!u || typeof u !== 'object') return;
    const rec = u;
    const ev =
      rec.emailVerified === true
        ? true
        : rec.user &&
            typeof rec.user === 'object' &&
            rec.user !== null &&
            'emailVerified' in rec.user
          ? rec.user.emailVerified === true
          : false;
    if (ev) {
      void router.replace('/onboarding');
    }
  }, [mePoll.data, router]);

  const onVerify = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!token) {
      setErr('Missing verification token.');
      return;
    }
    try {
      await verifyM.mutateAsync(token);
      setMsg('Email verified successfully. You can sign in now.');
    } catch (error) {
      setErr(toMessage(error, 'Could not verify email.'));
    }
  };

  const onResend = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await resendM.mutateAsync(email.trim());
      setMsg('Verification email sent.');
    } catch (error) {
      setErr(toMessage(error, 'Could not resend verification email.'));
    }
  };

  return (
    <>
      <Head><title>Verify Email</title></Head>
      <MarketingShell maxWidthClass="max-w-md" headerMode="auth">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h1 className="text-xl font-semibold text-white">Verify email</h1>
          <p className="text-sm text-slate-400">
            Verify with `/auth/verify-email`, or resend verification email.
          </p>
          {msg ? <div className="rounded bg-emerald-950/40 p-3 text-sm text-emerald-200">{msg}</div> : null}
          {err ? <div className="rounded bg-rose-950/40 p-3 text-sm text-rose-200">{err}</div> : null}

          <form onSubmit={onVerify} className="space-y-3">
            <button
              type="submit"
              disabled={!token || verifyM.isPending}
              className="w-full rounded bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {verifyM.isPending ? 'Verifying…' : 'Verify from link token'}
            </button>
          </form>

          <form onSubmit={onResend} className="space-y-3 border-t border-slate-800 pt-4">
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
              disabled={resendM.isPending}
              className="w-full rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {resendM.isPending ? 'Sending…' : 'Resend verification email'}
            </button>
          </form>

          <p className="text-sm text-slate-400">
            Go to <Link href="/login" className="text-orange-400">Sign in</Link>
          </p>
        </div>
      </MarketingShell>
    </>
  );
}
