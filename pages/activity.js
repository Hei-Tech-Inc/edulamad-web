import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { ActivityStats } from '@/components/activity/ActivityStats';
import { WeeklyActivityHeatmap } from '@/components/activity/WeeklyActivityHeatmap';

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <Layout title="Activity">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h1 className="text-xl font-semibold text-slate-900">Activity tracker</h1>
            <p className="mt-1 text-sm text-slate-600">
              Follow your daily questions, quiz attempts, flashcard practice, and XP growth.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-100">Your stats</h2>
            <div className="mt-3">
              <ActivityStats />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-100">Weekly heatmap</h2>
            <div className="mt-3">
              <WeeklyActivityHeatmap />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-100">Feed</h2>
            <ActivityFeed limit={25} showHeaderLink={false} />
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
