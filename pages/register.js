// pages/register.js — public account registration
import React from 'react'
import Head from 'next/head'
import CompanyRegistrationPage from '../components/CompanyRegistrationsPage'
import { getMarketingBrandName } from '@/lib/landing-brand'

const BRAND = getMarketingBrandName()

export default function RegisterOrganisationPage() {
  return (
    <>
      <Head>
        <title>Create account — {BRAND}</title>
        <meta
          name="description"
          content={`Create your ${BRAND} account to sign in and use the app.`}
        />
      </Head>
      <CompanyRegistrationPage />
    </>
  )
}
