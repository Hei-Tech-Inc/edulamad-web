import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import API from '@/api/endpoints';
import { AppApiError } from '@/lib/api-error';

type UserProfile = {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  emailVerified?: boolean;
  isActive?: boolean;
};

function toProfile(raw: unknown): UserProfile {
  if (!raw || typeof raw !== 'object') {
    throw new AppApiError(500, 'Invalid profile response.');
  }
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === 'string' ? r.id : '';
  const email = typeof r.email === 'string' ? r.email : '';
  if (!id || !email) {
    throw new AppApiError(500, 'Profile response is missing id/email.');
  }
  return {
    id,
    email,
    name: typeof r.name === 'string' ? r.name : undefined,
    firstName: typeof r.firstName === 'string' ? r.firstName : undefined,
    lastName: typeof r.lastName === 'string' ? r.lastName : undefined,
    profilePhoto: typeof r.profilePhoto === 'string' ? r.profilePhoto : undefined,
    emailVerified: typeof r.emailVerified === 'boolean' ? r.emailVerified : undefined,
    isActive: typeof r.isActive === 'boolean' ? r.isActive : undefined,
  };
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['users', 'profile'] as const,
    retry: false,
    queryFn: async ({ signal }): Promise<UserProfile> => {
      const { data } = await apiClient.get<unknown>(API.users.profile, { signal });
      return toProfile(data);
    },
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      firstName?: string;
      lastName?: string;
    }) => {
      const body: Record<string, string> = {};
      if (typeof input.firstName === 'string') body.firstName = input.firstName;
      if (typeof input.lastName === 'string') body.lastName = input.lastName;
      const { data } = await apiClient.patch<unknown>(API.users.profile, body);
      return toProfile(data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', 'profile'] });
      void qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUploadProfilePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      await apiClient.patch(API.users.profilePhoto, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', 'profile'] });
      void qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export type { UserProfile };
