import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const rollbackRef = useRef({ notifications: [], unreadCount: 0 })

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const markAsReadM = useOptimisticMutation({
    mutationFn: async () => Promise.resolve({ ok: true }),
    onMutate: ({ id }) => {
      rollbackRef.current = { notifications, unreadCount }
      let wasUnread = false
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id)
        wasUnread = !!(target && !target.read)
        return prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      })
      if (wasUnread) {
        setUnreadCount((c) => Math.max(0, c - 1))
      }
    },
    onError: () => {
      // Silent rollback for notification reads.
      setNotifications(rollbackRef.current.notifications)
      setUnreadCount(rollbackRef.current.unreadCount)
    },
  })

  const markAsRead = async (id) => {
    markAsReadM.mutate({ id })
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = async (id) => {
    let wasUnread = false
    setNotifications((prev) => {
      const removed = prev.find((n) => n.id === id)
      wasUnread = !!(removed && !removed.read)
      return prev.filter((n) => n.id !== id)
    })
    if (wasUnread) {
      setUnreadCount((c) => Math.max(0, c - 1))
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
