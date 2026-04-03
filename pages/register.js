// pages/register.js — canonical organisation onboarding (B2B SaaS: /register)
import React from 'react'
import Head from 'next/head'
import CompanyRegistrationPage from '../components/CompanyRegistrationsPage'

export default function RegisterOrganisationPage() {
  return (
    <>
      <Head>
        <title>Create your organisation — Nsuo</title>
        <meta
          name="description"
          content="Register your aquaculture organisation on Nsuo and start onboarding."
        />
      </Head>
      <CompanyRegistrationPage />
    </>
  )
}
