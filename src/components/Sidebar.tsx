'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  useColorMode,
  Collapse,
  IconButton,
} from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CloseIcon } from '@chakra-ui/icons'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  requiredRoles?: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    label: 'Meus Tickets',
    href: '/tickets',
    icon: '🎫',
  },
  {
    label: 'Novo Ticket',
    href: '/tickets/create',
    icon: '➕',
    requiredRoles: [UserRole.CITIZEN],
  },
  {
    label: 'Gerenciamento',
    href: '/management',
    icon: '⚙️',
    requiredRoles: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: '📈',
    requiredRoles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.INSPECTOR],
  },
  {
    label: 'Administração',
    href: '/admin',
    icon: '👨‍💼',
    requiredRoles: [UserRole.ADMIN],
  },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { colorMode } = useColorMode()
  const pathname = usePathname()
  const { usuario: user } = useAuthStore()

  const filteredNavItems = navItems.filter((item) => {
    if (item.requiredRoles && user) {
      return (item.requiredRoles as string[]).includes(user.perfil)
    }
    return true
  })

  const sidebarContent = (
    <VStack align="start" spacing={2} height="100%">
      {/* Close button for mobile */}
      <Box width="100%" display={{ base: 'flex', md: 'none' }} justifyContent="flex-end" p={2}>
        <IconButton
          aria-label="Close sidebar"
          icon={<CloseIcon />}
          onClick={onClose}
          variant="ghost"
        />
      </Box>

      {/* Navigation Items */}
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} style={{ width: '100%' }}>
            <Box
              w="100%"
              px={4}
              py={3}
              borderRadius="lg"
              bg={isActive ? 'primary.500' : 'transparent'}
              color={isActive ? 'white' : 'inherit'}
              cursor="pointer"
              _hover={{
                bg: isActive ? 'primary.600' : (colorMode === 'dark' ? 'gray.700' : 'gray.100'),
              }}
              transition="all 0.2s"
              onClick={onClose}
            >
              <HStack spacing={3}>
                <Text fontSize="lg">{item.icon}</Text>
                <Text fontWeight="500">{item.label}</Text>
              </HStack>
            </Box>
          </Link>
        )
      })}
    </VStack>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Collapse in={isOpen}>
        <Box
          position="fixed"
          left={0}
          top={16}
          width="100%"
          height="calc(100vh - 64px)"
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          overflowY="auto"
          display={{ base: 'block', md: 'none' }}
          zIndex={50}
          p={4}
          boxShadow="md"
        >
          {sidebarContent}
        </Box>
      </Collapse>

      {/* Desktop Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={16}
        width={250}
        height="calc(100vh - 64px)"
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        borderRight="1px"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        overflowY="auto"
        display={{ base: 'none', md: 'block' }}
        p={4}
      >
        {sidebarContent}
      </Box>
    </>
  )
}



