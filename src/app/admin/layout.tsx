'use client'

import React, { ReactNode } from 'react'
import { Box, Flex, useMediaQuery } from '@chakra-ui/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Órgãos', href: '/admin/orgaos', icon: '🏢' },
  { label: 'Competências', href: '/admin/competencias', icon: '🎯' },
  { label: 'Usuários', href: '/admin/usuarios', icon: '👥' },
  { label: 'Configurações', href: '/admin/configuracoes', icon: '⚙️' },
]

const bottomNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Órgãos', href: '/admin/orgaos', icon: '🏢' },
  { label: 'Usuários', href: '/admin/usuarios', icon: '👥' },
  { label: 'Mais', href: '/admin/configuracoes', icon: '⋯' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { usuario, isLoading } = useAuthStore()
  const [isDesktop] = useMediaQuery('(min-width: 768px)')

  React.useEffect(() => {
    if (!isLoading && (!usuario || usuario.perfil !== 'Admin')) {
      router.push('/login')
    }
  }, [usuario, isLoading, router])

  if (isLoading) {
    return null
  }

  return (
    <Box>
      <Header titulo="Painel Administrativo" />
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
