'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Button,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useAuthStore } from '@/stores/authStore'
import { CitizenNotificationsMenu } from './CitizenNotificationsMenu'
import { CitizenUserMenu } from './CitizenUserMenu'
import { CitizenMobileNav } from './CitizenMobileNav'

const NAV_LINKS = [
  { label: 'Meus Chamados', href: '/cidadao/chamados' },
  { label: 'Notificações', href: '/cidadao/notificacoes' },
] as const

export function CitizenHeader() {
  const pathname = usePathname()
  const usuario = useAuthStore((state) => state.usuario)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDesktop] = useMediaQuery('(min-width: 768px)')

  return (
    <Box
      as="header"
      bg="white"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={50}
      px={{ base: 4, md: 6 }}
      py={3}
    >
      <Flex align="center" justify="space-between" maxW="1200px" mx="auto">
        <HStack spacing={{ base: 2, md: 6 }}>
          {!isDesktop && (
            <IconButton
              aria-label="Abrir menu"
              icon={<HamburgerIcon />}
              variant="ghost"
              onClick={onOpen}
            />
          )}

          <Link href="/cidadao/chamados">
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
              color="primary.600"
              _hover={{ color: 'primary.700' }}
            >
              Fiscalize
            </Text>
          </Link>

          {isDesktop && (
            <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Button
                    key={link.href}
                    as={Link}
                    href={link.href}
                    variant="ghost"
                    size="sm"
                    fontWeight={isActive ? 'semibold' : 'medium'}
                    color={isActive ? 'primary.600' : 'gray.600'}
                    bg={isActive ? 'primary.50' : 'transparent'}
                    _hover={{ bg: isActive ? 'primary.50' : 'gray.100' }}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </HStack>
          )}
        </HStack>

        <HStack spacing={2}>
          <CitizenNotificationsMenu />
          {usuario && <CitizenUserMenu usuario={usuario} />}
        </HStack>
      </Flex>

      {usuario && (
        <CitizenMobileNav
          isOpen={isOpen}
          onClose={onClose}
          navLinks={[...NAV_LINKS]}
          usuario={usuario}
        />
      )}
    </Box>
  )
}
