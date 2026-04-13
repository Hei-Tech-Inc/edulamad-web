import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import { useMyNotifications } from '@/hooks/dashboard/useDashboardOverview'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Notifications">
        <NotificationsContent />
      </Layout>
    </ProtectedRoute>
  )
}

function NotificationsContent() {
  const queryClient = useQueryClient()
  const notificationsQ = useMyNotifications(30)
  const markReadM = useMutation({
    mutationFn: async (id) => {
      await apiClient.post(API.notifications.read(id))
      return id
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
      {notificationsQ.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading notifications...</p> : null}
      {notificationsQ.isError ? (
        <p className="mt-3 text-sm text-rose-700">Could not load notifications.</p>
      ) : null}
      {!notificationsQ.isLoading && !notificationsQ.isError ? (
        <ul className="mt-4 space-y-2">
          {(notificationsQ.data || []).map((n) => (
            <li key={n.id} className="rounded-lg border border-slate-100 px-3 py-2">
              <p className="text-sm text-slate-900">{n.title}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">{n.createdAt || ''}</p>
                <button
                  type="button"
                  onClick={() => markReadM.mutate(n.id)}
                  className="text-xs font-medium text-orange-700 hover:text-orange-800"
                >
                  Mark read
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
