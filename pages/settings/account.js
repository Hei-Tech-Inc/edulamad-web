import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import {
  useUpdateUserProfile,
  useUploadProfilePhoto,
  useUserProfile,
} from '../../src/hooks/auth/useUserProfile';
import { useToast } from '../../components/Toast';
import { AppApiError } from '../../src/lib/api-error';

function messageFromError(err, fallback) {
  if (err instanceof AppApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function AccountSettingsInner() {
  const { showToast } = useToast();
  const profileQ = useUserProfile();
  const updateM = useUpdateUserProfile();
  const uploadM = useUploadProfilePhoto();

  const profile = profileQ.data;
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    });
  }, [profile]);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      await updateM.mutateAsync({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
      });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(messageFromError(err, 'Could not update profile.'), 'error');
    }
  };

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadM.mutateAsync(file);
      showToast('Profile photo updated.', 'success');
    } catch (err) {
      showToast(
        messageFromError(
          err,
          'Could not upload profile photo. Your backend may not have object storage enabled.',
        ),
        'error',
      );
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="settings-light mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Account settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage your profile using `/users/profile` and `/users/profile/photo`.
        </p>
      </div>

      {profileQ.isError ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          {messageFromError(profileQ.error, 'Could not load profile settings.')}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center gap-4">
          {profile?.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profilePhoto}
              alt="Profile"
              className="h-14 w-14 rounded-full border border-slate-300 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-700">
              {(profile?.email?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-50">
            {uploadM.isPending ? 'Uploading…' : 'Upload photo'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onPhotoChange}
              disabled={uploadM.isPending}
            />
          </label>
        </div>

        <form className="space-y-4" onSubmit={onSave}>
          <div>
            <label className="mb-1 block text-sm text-slate-600">Email</label>
            <input
              value={profile?.email || ''}
              disabled
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-600">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={updateM.isPending || profileQ.isLoading}
            className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateM.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Account settings">
        <AccountSettingsInner />
      </Layout>
    </ProtectedRoute>
  );
}
