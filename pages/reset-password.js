import Head from 'next/head';
import Link from 'next/link';
import MarketingShell from '../components/marketing/MarketingShell';

export default function ResetPasswordPage() {
  return (
    <>
      <Head><title>Reset Password</title></Head>
      <MarketingShell maxWidthClass="max-w-md" headerMode="auth">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-xl font-semibold text-white">Reset password</h1>
          <p className="mt-2 text-sm text-slate-400">
            Password reset is not yet available in production.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Please contact support if you need help recovering access.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Back to <Link href="/login" className="text-orange-400">Sign in</Link>
          </p>
        </div>
      </MarketingShell>
    </>
  );
}
