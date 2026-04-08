// pages/pending-approval.js
import React from 'react'
import PendingApprovalPage from '../components/PendingApprovalPage'
import Head from 'next/head'
import { getAppName } from '@/lib/app-brand'

export default function PendingApproval() {
  return (
    <>
      <Head>
        <title>Registration status — {getAppName()}</title>
        <meta
          name="description"
          content={`Verify your email and continue to ${getAppName()}.`}
        />
      </Head>
      <PendingApprovalPage />
    </>
  )
}
