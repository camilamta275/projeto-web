'use client'

import React from 'react'
import { useAuthStore } from '@/stores/authStore'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)

  React.useEffect(() => {
    if (!sessionChecked) {
      fetchMe()
    }
  }, [fetchMe, sessionChecked])

  return <>{children}</>
}
