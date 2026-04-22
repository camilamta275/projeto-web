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
import { usePathname } from 'next/navigation'
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
  const { usuario } = useAuthStore()
  const { colorMode } = useColorMode()

  const bgColor = colorMode === 'dark' ? '#1a202c' : '#2d3748'
  const textColor = 'white'
  const activeColor = '#667eea'

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
      display={{ base: 'none', md: 'block' }}
      overflowY="auto"
    >
      <VStack align="stretch" spacing={4}>
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
          <HStack spacing={2} pb={2} opacity={0.8}>
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
        <VStack align="stretch" spacing={1} flex={1}>
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
      </VStack>
    </Box>
  )
}
