'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Button,
  Text,
  VStack,
  HStack,
  Spinner,
  Box,
} from '@chakra-ui/react'
import { useAuthStore } from '@/stores/authStore'
import type { Usuario } from '@/types'

interface CitizenUserMenuProps {
  usuario: Usuario
  onNavigate?: () => void
}

const PERFIL_LABELS: Record<Usuario['perfil'], string> = {
  'Cidadão': 'Cidadão',
  Gestor: 'Gestor',
  Admin: 'Administrador',
}

export function CitizenUserMenu({ usuario, onNavigate }: CitizenUserMenuProps) {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      onNavigate?.()
      router.push('/login')
    }
  }

  const handleAccountClick = () => {
    onNavigate?.()
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        px={2}
        _hover={{ bg: 'gray.100' }}
        isDisabled={isLoggingOut}
      >
        <HStack spacing={2}>
          <Avatar name={usuario.nome} size="sm" bg="primary.500" color="white" />
          <Text
            display={{ base: 'none', lg: 'block' }}
            fontSize="sm"
            fontWeight="medium"
            color="gray.700"
            maxW="140px"
            isTruncated
          >
            {usuario.nome}
          </Text>
        </HStack>
      </MenuButton>

      <MenuList className="shadow-lg rounded-md" minW="240px">
        <Box px={4} py={3}>
          <VStack align="start" spacing={0}>
            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
              {usuario.nome}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {usuario.email}
            </Text>
            <Text fontSize="xs" color="primary.600" mt={1}>
              {PERFIL_LABELS[usuario.perfil]}
            </Text>
          </VStack>
        </Box>
        <MenuDivider />
        <MenuItem
          as={Link}
          href="/cidadao/conta"
          onClick={handleAccountClick}
          fontSize="sm"
        >
          Minha Conta
        </MenuItem>
        <MenuDivider />
        <MenuItem
          onClick={handleLogout}
          color="red.500"
          fontSize="sm"
          isDisabled={isLoggingOut}
        >
          <HStack spacing={2}>
            {isLoggingOut && <Spinner size="xs" />}
            <Text>{isLoggingOut ? 'Saindo...' : 'Sair'}</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
