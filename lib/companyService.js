import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

/** Normalise GET /organisations/me (or similar) into the shape company-settings expects. */
function mapOrgToCompany(org) {
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

const companyService = {
  getCompanyDetails: async () => {
    try {
      const { data } = await apiClient.get(API.organisations.me)
      return { data: mapOrgToCompany(data), error: null }
    } catch (error) {
      console.error('Error fetching company details:', error)
      return { data: null, error }
    }
  },

  updateCompany: async (_companyId, companyData) => {
    try {
      const payload = {}
      if (companyData?.name != null && companyData.name !== '') {
        payload.name = companyData.name
      }
      if (companyData?.abbreviation != null) {
        payload.registrationNumber = companyData.abbreviation
      }
      if (companyData?.address != null) {
        payload.community = companyData.address
      }
      const { data } = await apiClient.patch(API.organisations.me, payload)
      return { data: mapOrgToCompany(data), error: null }
    } catch (error) {
      console.error('Error updating company:', error)
      return { data: null, error }
    }
  },

  getAllCompanies: async () => {
    try {
      const { data } = await apiClient.get(API.admin.organizations.list)
      const list = Array.isArray(data) ? data : []
      return { data: list.map(mapAdminOrgToRow).filter(Boolean), error: null }
    } catch (error) {
      console.error('Error fetching companies:', error)
      return { data: null, error }
    }
  },

  deleteCompany: async (companyId) => {
    try {
      await apiClient.delete(API.admin.organizations.detail(String(companyId)))
      return { error: null }
    } catch (error) {
      console.error('Error deleting company:', error)
      return { error }
    }
  },

  uploadLogo: async (companyId, file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data: uploaded } = await apiClient.post(API.files.upload, formData)
      const logoUrl = uploaded?.url ?? uploaded?.key
      if (!logoUrl) {
        throw new Error('Upload did not return a file URL')
      }
      const { data: updated } = await apiClient.put(
        API.admin.organizations.detail(String(companyId)),
        { logo: logoUrl },
      )
      const row = mapOrgToCompany(updated) ?? { id: companyId }
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

  deleteLogo: async (companyId, _logoUrl) => {
    try {
      const { data: updated } = await apiClient.put(
        API.admin.organizations.detail(String(companyId)),
        { logo: '' },
      )
      return {
        data: mapOrgToCompany({ ...updated, logoUrl: null, logo: null }),
        error: null,
      }
    } catch (error) {
      console.error('Error deleting logo:', error)
      return { data: null, error }
    }
  },
}

export default companyService
