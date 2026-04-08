<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Nsuo aquaculture farm management platform. PostHog is initialized via `instrumentation-client.ts` (Next.js 15.3+ pattern) with a reverse proxy through `/ingest` for improved data reliability. User identification is applied at login, signup, and company registration. Exception capture (`captureException`) is added at all critical failure points.

| Event | Description | File |
|---|---|---|
| `user_logged_in` | User successfully logs in with email or Google | `pages/login.js` |
| `user_signed_up` | User successfully creates a new team member account | `pages/signup.js` |
| `company_registered` | A new organisation is registered on Nsuo | `components/CompanyRegistrationsPage.js` |
| `user_logged_out` | User confirms logout from the application | `components/LogoutConfirmationModal.js` |
| `cage_created` | A new aquaculture cage (farm unit) is created | `components/CreateCageForm.js` |
| `cage_stocked` | A cage is stocked with a new fish batch | `components/StockingForm.js` |
| `harvest_recorded` | A harvest record is submitted for a cage | `components/HarvestForm.js` |
| `batch_topped_up` | An in-cycle top-up is recorded for an existing fish batch | `components/TopUpForm.js` |
| `daily_entry_submitted` | A daily farm data entry is submitted | `components/DailyEntryForm.js` |
| `bulk_upload_submitted` | A bulk data upload (CSV/Excel) is submitted | `components/BulkDailyUploadForm.js` |
| `data_exported` | Farm data is exported to CSV or JSON | `pages/export.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/366725/dashboard/1426309
- **Insight — Signup to First Cage Stocked (Onboarding Funnel)**: https://us.posthog.com/project/366725/insights/5EEKHj01
- **Insight — Company Registration to First Cage (Conversion)**: https://us.posthog.com/project/366725/insights/Ibn2jYv9
- **Insight — Daily Active Users — Logins & Signups**: https://us.posthog.com/project/366725/insights/tL66KK24
- **Insight — Farm Operations Activity**: https://us.posthog.com/project/366725/insights/qD40df2o
- **Insight — User Churn Signal — Daily Logouts**: https://us.posthog.com/project/366725/insights/m1ZXBKN1

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-pages-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
