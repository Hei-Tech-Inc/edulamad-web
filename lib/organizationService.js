import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth.store'
import { AppApiError } from '@/lib/api-error'

/** Normalise GET /organisations/me (or similar) into the shape org settings UI expects. */
function mapOrgToOrganizationRow(org) {
  if (!org || typeof org !== 'object') return null
  const o = org
  return {
    id: o.id,
    name: o.name ?? '',
    abbreviation: o.registrationNumber ?? '',
    address: o.community ?? o.district ?? '',
    contact_email: o.contactEmail ?? o.contact_email ?? '',
    contact_phone: o.contactPhone ?? o.contact_phone ?? '',
    logo_url: o.logoUrl ?? o.logo ?? o.logo_url ?? null,
    settings: o.settings ?? {},
    slug: o.slug,
  }
}

function mapAdminOrgToRow(o) {
  if (!o || typeof o !== 'object') return null
  return {
    id: o.id,
    name: o.name ?? '',
    abbreviation: o.slug ?? '',
    contact_email: o.description ?? '',
    contact_phone: '',
    created_at: o.createdAt ?? o.created_at ?? new Date().toISOString(),
    user_count: Array.isArray(o.members) ? o.members.length : 0,
    isActive: o.isActive !== false,
  }
}

function isMissingEndpointError(error) {
  if (!error) return false
  const status = typeof error?.status === 'number' ? error.status : error?.response?.status
  const message = typeof error?.message === 'string' ? error.message : ''
  return status === 404 && /cannot get/i.test(message)
}

const organizationService = {
  getOrganizationDetails: async () => {
    try {
      const org = useAuthStore.getState().org
      if (org) {
        return { data: mapOrgToOrganizationRow(org), error: null }
      }
      return {
        data: null,
        error: new AppApiError(
          404,
          'Institution profile endpoint is unavailable on this backend. You can still use dashboard and study features.',
        ),
      }
    } catch (error) {
      console.error('Error fetching organization details:', error)
      return { data: null, error }
    }
  },

  updateOrganization: async (_orgId, orgData) => {
    try {
      return {
        data: mapOrgToOrganizationRow({
          id: orgData?.id ?? _orgId ?? 'local-org',
          name: orgData?.name ?? '',
          registrationNumber: orgData?.abbreviation ?? '',
          community: orgData?.address ?? '',
          contactEmail: orgData?.contact_email ?? '',
          contactPhone: orgData?.contact_phone ?? '',
          logoUrl: orgData?.logo_url ?? null,
          settings: orgData?.settings ?? {},
        }),
        error: new AppApiError(
          404,
          'Institution update endpoint is not available on this backend yet. Changes were kept locally in the form only.',
        ),
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      return { data: null, error }
    }
  },

  listOrganizations: async () => {
    try {
      const { data } = await apiClient.get(API.admin.organizations.list)
      const list = Array.isArray(data) ? data : []
      return { data: list.map(mapAdminOrgToRow).filter(Boolean), error: null }
    } catch (error) {
      if (isMissingEndpointError(error)) {
        const org = useAuthStore.getState().org
        const fallback = org ? [mapAdminOrgToRow(org)].filter(Boolean) : []
        return { data: fallback, error: null }
      }
      console.error('Error fetching organizations:', error)
      return { data: null, error }
    }
  },

  deleteOrganization: async (orgId) => {
    try {
      await apiClient.delete(API.admin.organizations.detail(String(orgId)))
      return { error: null }
    } catch (error) {
      console.error('Error deleting organization:', error)
      return { error }
    }
  },

  uploadLogo: async (orgId, file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data: uploaded } = await apiClient.post(API.files.upload, formData)
      const logoUrl = uploaded?.url ?? uploaded?.key
      if (!logoUrl) {
        throw new Error('Upload did not return a file URL')
      }
      const { data: updated } = await apiClient.put(
        API.admin.organizations.detail(String(orgId)),
        { logo: logoUrl },
      )
      const row = mapOrgToOrganizationRow(updated) ?? { id: orgId }
      row.logo_url = updated?.logo ?? updated?.logoUrl ?? logoUrl
      return { data: row, error: null }
    } catch (error) {
      console.error('Error uploading logo:', error)
      return {
        data: null,
        error,
      }
    }
  },

  deleteLogo: async (orgId, _logoUrl) => {
    try {
      const { data: updated } = await apiClient.put(
        API.admin.organizations.detail(String(orgId)),
        { logo: '' },
      )
      return {
        data: mapOrgToOrganizationRow({ ...updated, logoUrl: null, logo: null }),
        error: null,
      }
    } catch (error) {
      console.error('Error deleting logo:', error)
      return { data: null, error }
    }
  },
}

export default organizationService
