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
import SectionTitle from '../../src/components/atoms/SectionTitle';
import AccountProfileForm from '../../src/components/organisms/AccountProfileForm';
import StudentCreditsReferralPanel from '../../src/components/organisms/StudentCreditsReferralPanel';

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
      <SectionTitle
        title="Account settings"
        description="Manage your profile using `/users/profile` and `/users/profile/photo`."
        titleClassName="text-2xl font-semibold text-slate-100"
        descriptionClassName="mt-1 text-sm text-slate-300"
      />

      <StudentCreditsReferralPanel />

      {profileQ.isError ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          {messageFromError(profileQ.error, 'Could not load profile settings.')}
        </div>
      ) : null}

      <AccountProfileForm
        profile={profile}
        form={form}
        onChange={(key, value) => setForm((s) => ({ ...s, [key]: value }))}
        onSubmit={onSave}
        onPhotoChange={onPhotoChange}
        isSaving={updateM.isPending}
        isUploading={uploadM.isPending}
        isLoading={profileQ.isLoading}
      />
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
