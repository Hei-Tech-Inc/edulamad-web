import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Building, Mail, Phone, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MarketingShell from './marketing/MarketingShell'
import {
  safePosthogCapture,
  safePosthogCaptureException,
  safePosthogIdentify,
} from '@/lib/safe-analytics'

function formatRegistrationError(regError) {
  if (!regError) return 'Registration failed'
  if (typeof regError === 'string') return regError
  const lines = [regError.message || 'Registration failed']
  if (Array.isArray(regError.details) && regError.details.length) {
    for (const d of regError.details) {
      const field = d.field != null ? String(d.field) : 'field'
      const msg = d.message != null ? String(d.message) : ''
      lines.push(`• ${field}: ${msg}`)
    }
  }
  return lines.join('\n')
}

const CompanyRegistrationPage = () => {
  const router = useRouter()
  const { signUpWithEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    farm_name: 'Main farm',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (String(formData.admin_password || '').length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const slugRaw = String(formData.abbreviation || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    try {
      const farmName =
        String(formData.farm_name || '').trim() || 'Main farm'
      const { error: regError } = await signUpWithEmail(
        formData.admin_email,
        formData.admin_password,
        formData.admin_name,
        {
          orgName: formData.name.trim(),
          orgSlug: slugRaw || undefined,
          createDefaultFarm: farmName,
        },
      )

      if (regError) {
        setError(formatRegistrationError(regError))
        return
      }

      safePosthogIdentify(formData.admin_email, {
        email: formData.admin_email,
        name: formData.admin_name,
      })
      safePosthogCapture('company_registered', {
        company_name: formData.name.trim(),
        admin_email: formData.admin_email,
      })
      router.replace('/dashboard')
    } catch (err) {
      safePosthogCaptureException(err)
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const fieldClass =
    'block w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300'

  return (
    <MarketingShell maxWidthClass="max-w-3xl" headerMode="auth">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to overview
      </Link>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Company onboarding · Step 1
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Create your organisation
        </h1>
        <p className="mt-2 max-w-xl text-slate-400">
          Register as the owner. We create your organisation, a first farm (you
          can rename it later), and your owner account so you can sign in right
          away.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4 sm:px-8">
            <h2 className="font-medium text-slate-200">Organisation details</h2>
            <p className="text-xs text-slate-500">
              Fields marked * are required before we provision your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-8">
            {error && (
              <div className="whitespace-pre-wrap rounded-xl border border-red-400/25 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <h3 className="text-lg font-semibold text-white">
                Company information
              </h3>

              <div>
                <label className={labelClass}>
                  Company name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Building className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${fieldClass} pl-10`}
                    placeholder="Volta Aquafarms Ltd"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>URL slug (optional)</label>
                <input
                  type="text"
                  name="abbreviation"
                  value={formData.abbreviation}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="volta-aqua"
                  maxLength={48}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Short label for your organisation URL (letters, numbers,
                  hyphens).
                </p>
              </div>

              <div>
                <label className={labelClass}>Company address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={fieldClass}
                  placeholder="Registered or main operations address"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Contact email (optional)</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className={`${fieldClass} pl-10`}
                      placeholder="ops@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Contact phone</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Phone className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className={`${fieldClass} pl-10`}
                      placeholder="+233 55 555 5555"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="text-lg font-semibold text-white">
                  Owner account
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  This user becomes the organisation owner with full access.
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Full name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="admin_name"
                    value={formData.admin_name}
                    onChange={handleChange}
                    className={`${fieldClass} pl-10`}
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Owner email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="admin_email"
                    value={formData.admin_email}
                    onChange={handleChange}
                    className={`${fieldClass} pl-10`}
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Minimum 8 characters"
                  minLength="8"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  First farm name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="farm_name"
                  value={formData.farm_name}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Main farm"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Creates your first farm via the API (POST /farms) right after
                  registration.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center rounded py-3.5 text-sm font-semibold text-white transition ${
                loading
                  ? 'cursor-not-allowed bg-sky-900/50'
                  : 'bg-sky-700 hover:bg-sky-800'
              }`}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating organisation…
                </>
              ) : (
                'Create organisation'
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-sky-400 hover:text-sky-300"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
    </MarketingShell>
  )
}

export default CompanyRegistrationPage
