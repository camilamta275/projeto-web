'use client'

import React, { ReactNode } from 'react'
import { Box, Flex, useMediaQuery } from '@chakra-ui/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  { label: 'Dashboard', href: '/gestor/dashboard', icon: '📊' },
  { label: 'Fila', href: '/gestor/fila', icon: '📭' },
  { label: 'Mapa', href: '/gestor/mapa', icon: '🗺️' },
  { label: 'Relatórios', href: '/gestor/relatorios', icon: '📈' },
  { label: 'Perfil', href: '/gestor/perfil', icon: '👤' },
]

const bottomNavItems = [
  { label: 'Dashboard', href: '/gestor/dashboard', icon: '📊' },
  { label: 'Fila', href: '/gestor/fila', icon: '📭' },
  { label: 'Mapa', href: '/gestor/mapa', icon: '🗺️' },
  { label: 'Mais', href: '/gestor/perfil', icon: '⋯' },
]

export default function GestorLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { usuario, isLoading } = useAuthStore()
  const [isDesktop] = useMediaQuery('(min-width: 768px)')

  React.useEffect(() => {
    if (!isLoading && (!usuario || usuario.perfil !== 'Gestor')) {
      router.push('/login')
    }
  }, [usuario, isLoading, router])

  if (isLoading) {
    return null
  }

  return (
    <Box>
      <Header titulo="Gestor - Fila de Chamados" />
      <Flex>
        <Sidebar items={sidebarItems} />
        <Box flex={1} ml={{ base: 0, md: '250px' }} pb={isDesktop ? 0 : '80px'}>
          {children}
        </Box>
      </Flex>
      {!isDesktop && <BottomNav items={bottomNavItems} />}
    </Box>
  )
}
