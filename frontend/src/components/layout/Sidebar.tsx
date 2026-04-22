'use client'

import React from 'react'
import {
  Box,
  VStack,
  Text,
  HStack,
  Avatar,
  Divider,
  useColorMode,
} from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface SidebarItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  items: SidebarItem[]
  titulo?: string
}

export function Sidebar({ items, titulo = 'Recife Inteligente' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { usuario, logout } = useAuthStore()
  const { colorMode } = useColorMode()

  const bgColor = colorMode === 'dark' ? '#1a202c' : '#2d3748'
  const textColor = 'white'
  const activeColor = '#667eea'

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Box
      width="250px"
      bg={bgColor}
      color={textColor}
      minH="100vh"
      p={4}
      position="fixed"
      left={0}
      top={0}
      display={{ base: 'none', md: 'flex' }}
      flexDirection="column"
      overflowY="auto"
    >
      <Box flex={1}>
        {/* Logo/Título */}
        <VStack align="start" spacing={1} pb={4}>
          <Text fontSize="lg" fontWeight="bold" color={activeColor}>
            {titulo}
          </Text>
          <Text fontSize="xs" opacity={0.7}>
            {usuario?.perfil}
          </Text>
        </VStack>

        <Divider borderColor="gray.600" />

        {/* Usuário */}
        {usuario && (
          <HStack spacing={2} py={2} opacity={0.8}>
            <Avatar name={usuario.nome} size="sm" />
            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="500">
                {usuario.nome}
              </Text>
              <Text fontSize="xs" opacity={0.7}>
                {usuario.email}
              </Text>
            </VStack>
          </HStack>
        )}

        <Divider borderColor="gray.600" />

        {/* Menu Items */}
        <VStack align="stretch" spacing={1} mt={4}>
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Box
                  px={3}
                  py={2}
                  borderRadius="md"
                  bg={isActive ? activeColor : 'transparent'}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: isActive ? activeColor : 'rgba(102,126,234,0.1)' }}
                  width="100%"
                >
                  <HStack spacing={2}>
                    <Text fontSize="lg">{item.icon}</Text>
                    <Text fontSize="sm" fontWeight={isActive ? 'bold' : 'normal'}>
                      {item.label}
                    </Text>
                  </HStack>
                </Box>
              </Link>
            )
          })}
        </VStack>
      </Box>

      {/* Logout Button - Sticky at bottom */}
      <Box
        borderTop="1px solid"
        borderColor="gray.600"
        pt={2}
      >
        <Box
          px={3}
          py={2}
          borderRadius="md"
          bg="transparent"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ bg: 'rgba(255, 0, 0, 0.3)' }}
          onClick={handleLogout}
          width="100%"
        >
          <HStack spacing={2}>
            <Text fontSize="lg">🚪</Text>
            <Text fontSize="sm" fontWeight="normal">
              Sair
            </Text>
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}
