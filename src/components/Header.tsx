'use client'

import React from 'react'
import {
  Box,
  Container,
  Flex,
  HStack,
  useColorMode,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Divider,
} from '@chakra-ui/react'
import { MoonIcon, SunIcon, BellIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { usuario: user, logout } = useAuthStore()
  const { naoLidas: unreadCount } = useNotificationStore()

  return (
    <Box bg={colorMode === 'dark' ? 'gray.800' : 'white'} boxShadow="sm" position="sticky" top={0} zIndex={100}>
      <Container maxW="100%" px={4} py={4}>
        <Flex justify="space-between" align="center">
          {/* Logo */}
          <Link href="/">
            <Box fontSize="2xl" fontWeight="bold" color="primary.600">
              Fiscalize
            </Box>
          </Link>

          {/* Navigation and Actions */}
          <HStack spacing={4}>
            {/* Theme Toggle */}
            <IconButton
              aria-label="Toggle theme"
              icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />

            {/* Notifications */}
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon />}
              position="relative"
              variant="ghost"
            >
              {unreadCount > 0 && (
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  width="20px"
                  height="20px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Box>
              )}
            </IconButton>

            {/* User Menu */}
            {user && (
              <Menu>
                <MenuButton as={Button} variant="ghost" p={0}>
                  <Avatar name={user.nome} size="sm" />
                </MenuButton>
                <MenuList>
                  <MenuItem>
                    <Link href="/profile">{user.nome}</Link>
                  </MenuItem>
                  <MenuItem>
                    <Link href="/settings">Configurações</Link>
                  </MenuItem>
                  <Divider my={2} />
                  <MenuItem onClick={logout}>Sair</MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
