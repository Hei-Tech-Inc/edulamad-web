import ProtectedRoute from '../../components/ProtectedRoute'
import Layout from '../../components/Layout'
import { PricingSubscriptionSection } from '@/components/pricing/PricingSubscriptionSection'
import { PromoCodeInput } from '@/components/pricing/PromoCodeInput'

export default function ProfileSubscriptionPage() {
  return (
    <ProtectedRoute>
      <Layout title="Subscription">
        <div className="space-y-8">
          <PricingSubscriptionSection />
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Promo code
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Redeem a code for bonus question credits or plan access (when your code supports it).
            </p>
            <div className="mt-4 max-w-md">
              <PromoCodeInput />
            </div>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
