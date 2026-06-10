'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  Avatar,
  Spinner,
  Box,
} from '@chakra-ui/react'
import { useAuthStore } from '@/stores/authStore'
import type { Usuario } from '@/types'

interface NavLink {
  label: string
  href: string
}

interface CitizenMobileNavProps {
  isOpen: boolean
  onClose: () => void
  navLinks: NavLink[]
  usuario: Usuario
}

const PERFIL_LABELS: Record<Usuario['perfil'], string> = {
  'Cidadão': 'Cidadão',
  Gestor: 'Gestor',
  Admin: 'Administrador',
}

export function CitizenMobileNav({
  isOpen,
  onClose,
  navLinks,
  usuario,
}: CitizenMobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      onClose()
      router.push('/login')
    }
  }

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack spacing={3}>
            <Avatar name={usuario.nome} size="sm" bg="primary.500" color="white" />
            <Box>
              <Text fontWeight="semibold" fontSize="sm">
                {usuario.nome}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {usuario.email}
              </Text>
            </Box>
          </HStack>
        </DrawerHeader>

        <DrawerBody py={4}>
          <VStack align="stretch" spacing={1}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Button
                  key={link.href}
                  as={Link}
                  href={link.href}
                  variant={isActive ? 'solid' : 'ghost'}
                  colorScheme={isActive ? 'blue' : 'gray'}
                  justifyContent="flex-start"
                  fontWeight={isActive ? 'semibold' : 'normal'}
                  onClick={onClose}
                >
                  {link.label}
                </Button>
              )
            })}

            <Divider my={2} />

            <Button
              as={Link}
              href="/cidadao/conta"
              variant={pathname === '/cidadao/conta' ? 'solid' : 'ghost'}
              colorScheme={pathname === '/cidadao/conta' ? 'blue' : 'gray'}
              justifyContent="flex-start"
              onClick={onClose}
            >
              Minha Conta
            </Button>

            <Button
              variant="ghost"
              colorScheme="red"
              justifyContent="flex-start"
              onClick={handleLogout}
              isDisabled={isLoggingOut}
              leftIcon={isLoggingOut ? <Spinner size="xs" /> : undefined}
            >
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
