import React from 'react'
import { Badge } from '@chakra-ui/react'

/**
 * StatusBadge Component
 * 
 * Displays a formatted badge for ticket status with appropriate color scheme
 * @param status - The ticket status (Aberto, Em Análise, Em Andamento, Aguardando, Resolvido, Fechado)
 * @returns Chakra UI Badge component with status-specific styling
 * 
 * @example
 * <StatusBadge status="Em Andamento" />
 */
interface StatusBadgeProps {
  status: 'Aberto' | 'Em Análise' | 'Em Andamento' | 'Aguardando' | 'Resolvido' | 'Fechado'
}

const statusColors: Record<string, string> = {
  'Aberto': 'blue',
  'Em Análise': 'yellow',
  'Em Andamento': 'purple',
  'Aguardando': 'orange',
  'Resolvido': 'green',
  'Fechado': 'gray',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge colorScheme={statusColors[status]}>
      {status}
    </Badge>
  )
}
