'use client'

import React from 'react'
import { IconButton, Box } from '@chakra-ui/react'
import { BellIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation'

interface NotificationBellProps {
  role?: 'citizen' | 'manager' | 'admin'
}

export function NotificationBell({ role = 'citizen' }: NotificationBellProps) {
  const router = useRouter()

  const href =
    role === 'citizen'
      ? '/cidadao/notificacoes'
      : role === 'manager'
      ? '/gestor/notificacoes'
      : '/admin/notificacoes'

  return (
    <Box position="relative" display="inline-flex">
      <IconButton
        aria-label="Notificações"
        icon={<BellIcon />}
        variant="ghost"
        isRound
        bg="whiteAlpha.200"
        color="white"
        _hover={{ bg: 'whiteAlpha.300' }}
        onClick={() => router.push(href)}
      />
    </Box>
  )
}
