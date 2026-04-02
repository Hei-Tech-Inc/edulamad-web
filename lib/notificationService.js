/**
 * In-app notifications were backed by Supabase. No Nsuo notification API is wired
 * here yet; methods return empty data so callers do not throw.
 */
const notificationService = {
  getNotifications: async (_userId, _limit = 50) => {
    return { data: [], error: null }
  },

  createNotification: async () => {
    return { data: null, error: null }
  },

  markAsRead: async (notificationId) => {
    return { data: { id: notificationId, read: true }, error: null }
  },

  markAllAsRead: async () => {
    return { data: [], error: null }
  },

  deleteNotification: async () => {
    return { error: null }
  },

  deleteAllNotifications: async () => {
    return { error: null }
  },

  getUnreadCount: async () => {
    return { count: 0, error: null }
  },
}

export default notificationService
