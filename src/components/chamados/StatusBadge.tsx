'use client'

import React from 'react'
import { Badge, BadgeProps } from '@chakra-ui/react'
import type { StatusChamado } from '@/types'

interface StatusBadgeProps extends BadgeProps {
  status: StatusChamado
}

const statusColorScheme: Record<StatusChamado, string> = {
  Aberto: 'blue',
  'Em Análise': 'yellow',
  'Em Andamento': 'purple',
  Aguardando: 'orange',
  Resolvido: 'green',
  Fechado: 'gray',
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  return (
    <Badge colorScheme={statusColorScheme[status]} {...props}>
      {status}
    </Badge>
  )
}
