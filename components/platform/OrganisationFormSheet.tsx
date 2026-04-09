import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import {
  createPlatformOrganisationSchema,
  updatePlatformOrganisationSchema,
  type CreatePlatformOrganisationValues,
  type UpdatePlatformOrganisationValues,
} from '@/schemas/platform-organisation';
import type { CreatePlatformOrganisationDto } from '@/api/types/platform-organisation.dto';
import {
  useCreatePlatformOrganisation,
  useUpdatePlatformOrganisation,
} from '@/hooks/platform/usePlatformOrganisationMutations';
import { isApiError } from '@/lib/api-error';

const label =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400';
const input =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-600/35';
const errText = 'mt-1 text-xs text-red-600 dark:text-red-400';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  orgId?: string;
  organisation?: Record<string, unknown> | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export function OrganisationFormSheet({
  open,
  mode,
  orgId,
  organisation,
  onClose,
  onSuccess,
}: Props) {
  const createMut = useCreatePlatformOrganisation();
  const updateMut = useUpdatePlatformOrganisation();

  const createForm = useForm<CreatePlatformOrganisationValues>({
    resolver: zodResolver(createPlatformOrganisationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      ownerId: '',
    },
  });

  const updateForm = useForm<UpdatePlatformOrganisationValues>({
    resolver: zodResolver(updatePlatformOrganisationSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      website: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open || mode !== 'edit' || !organisation) return;
    updateForm.reset({
      name:
        typeof organisation.name === 'string'
          ? organisation.name
          : String(organisation.name ?? ''),
      description:
        typeof organisation.description === 'string'
          ? organisation.description
          : '',
      logo: typeof organisation.logo === 'string' ? organisation.logo : '',
      website:
        typeof organisation.website === 'string' ? organisation.website : '',
      isActive:
        typeof organisation.isActive === 'boolean'
          ? organisation.isActive
          : true,
    });
  }, [open, mode, organisation, updateForm]);

  useEffect(() => {
    if (open && mode === 'create') {
      createForm.reset({
        name: '',
        slug: '',
        description: '',
        ownerId: '',
      });
    }
  }, [open, mode, createForm]);

  if (!open) return null;

  const busy = createMut.isPending || updateMut.isPending;

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    const body: CreatePlatformOrganisationDto = {
      name: values.name,
      slug: values.slug,
      ...(values.description ? { description: values.description } : {}),
      ...(values.ownerId ? { ownerId: values.ownerId } : {}),
    };
    try {
      await createMut.mutateAsync(body);
      onSuccess?.();
      onClose();
    } catch (e) {
      createForm.setError('root', {
        message: isApiError(e) ? e.message : 'Create failed',
      });
    }
  });

  const onUpdateSubmit = updateForm.handleSubmit(async (values) => {
    if (!orgId) return;
    try {
      await updateMut.mutateAsync({
        orgId,
        body: {
          ...(values.name !== undefined && values.name !== ''
            ? { name: values.name }
            : {}),
          ...(values.description !== undefined && values.description !== ''
            ? { description: values.description }
            : {}),
          ...(values.logo !== undefined && values.logo !== ''
            ? { logo: values.logo }
            : {}),
          ...(values.website !== undefined && values.website !== ''
            ? { website: values.website }
            : {}),
          ...(values.isActive !== undefined ? { isActive: values.isActive } : {}),
        },
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      updateForm.setError('root', {
        message: isApiError(e) ? e.message : 'Update failed',
      });
    }
  });

  return (
    <>
      <button
        type="button"
        aria-label="Close form"
        className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[2px]"
        onClick={() => !busy && onClose()}
      />
      <div
        className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'create' ? 'Create tenant' : 'Edit tenant'}
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto px-5 py-4">
          {mode === 'create' ? (
            <form className="space-y-4" onSubmit={onCreateSubmit}>
              <div>
                <label className={label} htmlFor="pt-name">
                  Name *
                </label>
                <input id="pt-name" className={input} {...createForm.register('name')} />
                {createForm.formState.errors.name ? (
                  <p className={errText}>{createForm.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div>
                <label className={label} htmlFor="pt-slug">
                  Slug *
                </label>
                <input id="pt-slug" className={input} {...createForm.register('slug')} />
                {createForm.formState.errors.slug ? (
                  <p className={errText}>{createForm.formState.errors.slug.message}</p>
                ) : null}
              </div>
              <div>
                <label className={label} htmlFor="pt-desc">
                  Description
                </label>
                <textarea
                  id="pt-desc"
                  rows={3}
                  className={input}
                  {...createForm.register('description')}
                />
              </div>
              <div>
                <label className={label} htmlFor="pt-owner">
                  Owner user ID (UUID)
                </label>
                <input id="pt-owner" className={input} {...createForm.register('ownerId')} />
                {createForm.formState.errors.ownerId ? (
                  <p className={errText}>
                    {createForm.formState.errors.ownerId.message}
                  </p>
                ) : null}
              </div>
              {createForm.formState.errors.root ? (
                <p className={errText}>{createForm.formState.errors.root.message}</p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
              >
                {busy ? 'Creating…' : 'Create organisation'}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={onUpdateSubmit}>
              <div>
                <label className={label} htmlFor="ptu-name">
                  Name
                </label>
                <input id="ptu-name" className={input} {...updateForm.register('name')} />
                {updateForm.formState.errors.name ? (
                  <p className={errText}>{updateForm.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div>
                <label className={label} htmlFor="ptu-desc">
                  Description
                </label>
                <textarea
                  id="ptu-desc"
                  rows={3}
                  className={input}
                  {...updateForm.register('description')}
                />
              </div>
              <div>
                <label className={label} htmlFor="ptu-logo">
                  Logo URL / key
                </label>
                <input id="ptu-logo" className={input} {...updateForm.register('logo')} />
                {updateForm.formState.errors.logo ? (
                  <p className={errText}>{updateForm.formState.errors.logo.message}</p>
                ) : null}
              </div>
              <div>
                <label className={label} htmlFor="ptu-web">
                  Website
                </label>
                <input id="ptu-web" className={input} {...updateForm.register('website')} />
                {updateForm.formState.errors.website ? (
                  <p className={errText}>
                    {updateForm.formState.errors.website.message}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  name="isActive"
                  control={updateForm.control}
                  render={({ field }) => (
                    <input
                      id="ptu-active"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <label htmlFor="ptu-active" className="text-sm text-slate-700 dark:text-slate-300">
                  Organisation active
                </label>
              </div>
              {updateForm.formState.errors.root ? (
                <p className={errText}>{updateForm.formState.errors.root.message}</p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
