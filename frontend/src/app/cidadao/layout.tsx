'use client'

import React, { ReactNode } from 'react'
import { Box, useMediaQuery } from '@chakra-ui/react'
import { HeaderCidadao } from '@/components/HeaderCidadao'
import { BottomNav } from '@/components/layout/BottomNav'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

const bottomNavItems = [
  { label: 'Chamados', href: '/cidadao/chamados', icon: '📋' },
  { label: 'Novo', href: '/cidadao/chamados/novo', icon: '➕' },
  { label: 'Notificações', href: '/cidadao/notificacoes', icon: '🔔' },
  { label: 'Perfil', href: '/cidadao/perfil', icon: '👤' },
]

export default function CidadaoLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { usuario, isLoading } = useAuthStore()
  const [isDesktop] = useMediaQuery('(min-width: 768px)')

  React.useEffect(() => {
    if (!isLoading && (!usuario || usuario.perfil !== 'Cidadão')) {
      router.push('/login')
    }
  }, [usuario, isLoading, router])

  if (isLoading) {
    return null
  }

  return (
    <Box>
      <HeaderCidadao />
      <Box pb={isDesktop ? 0 : '80px'}>
        {children}
      </Box>
      {!isDesktop && <BottomNav items={bottomNavItems} />}
    </Box>
  )
}
