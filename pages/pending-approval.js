// pages/pending-approval.js
import React from 'react'
import PendingApprovalPage from '../components/PendingApprovalPage'
import Head from 'next/head'

export default function PendingApproval() {
  return (
    <>
      <Head>
        <title>Registration status — Nsuo</title>
        <meta
          name="description"
          content="Check your organisation registration status on Nsuo."
        />
      </Head>
      <PendingApprovalPage />
    </>
  )
}
