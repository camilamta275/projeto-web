'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Spinner, Box } from '@chakra-ui/react'

export default function DashboardPage() {
  const router = useRouter()
  const { usuario, isLoading } = useAuthStore()

  React.useEffect(() => {
    if (!isLoading) {
      if (usuario) {
        // Redirecionar baseado no perfil
        const redirects: Record<string, string> = {
          Cidadão: '/cidadao/chamados',
          Gestor: '/gestor/dashboard',
          Admin: '/admin/dashboard',
        }
        router.push(redirects[usuario.perfil] || '/login')
      } else {
        router.push('/login')
      }
    }
  }, [usuario, isLoading, router])

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
      <Spinner size="lg" color="primary.500" />
    </Box>
  )
}
