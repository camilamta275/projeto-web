'use client'

import React from 'react'
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
} from '@chakra-ui/react'

import { useAuthStore } from '@/stores/authStore'

interface HeaderProps {
  titulo?: string
}

export function Header({ titulo = 'Smart City Help Desk' }: HeaderProps) {
  const { usuario, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      color="white"
      px={4}
      py={3}
      display={{ base: 'block', md: 'none' }}
      position="sticky"
      top={0}
      zIndex={50}
      boxShadow="md"
    >
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={0} flex={1}>
          <Text fontWeight="bold" fontSize="sm">
            {titulo}
          </Text>
          {usuario && <Text fontSize="xs" opacity={0.8}>{usuario.nome}</Text>}
        </VStack>

        {usuario && (
          <Menu>
            <MenuButton as={Avatar} name={usuario.nome} size="sm" cursor="pointer" />
            <MenuList color="black">
              <MenuItem>{usuario.nome}</MenuItem>
              <MenuItem>{usuario.email}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Box>
  )
}


