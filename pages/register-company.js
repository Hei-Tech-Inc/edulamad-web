// pages/register-company.js
import React from 'react'
import CompanyRegistrationPage from '../components/CompanyRegistrationsPage'
import Head from 'next/head'

export default function RegisterCompany() {
  return (
    <>
      <Head>
        <title>Create your organisation — Nsuo</title>
        <meta
          name="description"
          content="Register your aquaculture organisation on Nsuo and start company onboarding."
        />
      </Head>
      <CompanyRegistrationPage />
    </>
  )
}
