'use client'

import React from 'react'
import { Badge, BadgeProps, Box } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import type { StatusChamado } from '@/types'

interface StatusBadgeProps extends BadgeProps {
  status: StatusChamado
}

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.7); }
`

const statusColorScheme: Record<StatusChamado, string> = {
  Aberto: 'blue',
  'Em Análise': 'yellow',
  'Em Andamento': 'purple',
  Aguardando: 'orange',
  Resolvido: 'green',
  Fechado: 'gray',
}

const PULSE_STATUSES: StatusChamado[] = ['Aberto', 'Em Análise']

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const colorScheme = statusColorScheme[status] ?? 'gray'
  const shouldPulse = PULSE_STATUSES.includes(status)

  return (
    <Badge
      colorScheme={colorScheme}
      borderRadius="full"
      px={2}
      display="inline-flex"
      alignItems="center"
      gap={1.5}
      {...props}
    >
      {shouldPulse && (
        <Box
          as="span"
          display="inline-block"
          w={1.5}
          h={1.5}
          borderRadius="full"
          bg={`${colorScheme}.500`}
          animation={`${pulseAnim} 1.5s ease-in-out infinite`}
          flexShrink={0}
        />
      )}
      {status}
    </Badge>
  )
}
