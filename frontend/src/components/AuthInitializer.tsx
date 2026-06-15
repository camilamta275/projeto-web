'use client'

import React from 'react'
import { useAuthStore } from '@/stores/authStore'

const PUBLIC_ROUTES = ['/login', '/registro']

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const sessionChecked = useAuthStore((state) => state.sessionChecked)

  React.useEffect(() => {
    if (sessionChecked) return

    const pathname = window.location.pathname
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
    const hasToken = !!localStorage.getItem('token')

    if (isPublicRoute && !hasToken) {
      useAuthStore.setState({
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
        sessionChecked: true,
      })
      return
    }

    fetchMe()
  }, [fetchMe, sessionChecked])

  return <>{children}</>
}
