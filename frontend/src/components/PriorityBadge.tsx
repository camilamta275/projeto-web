import React from 'react'
import { Badge } from '@chakra-ui/react'

/**
 * PriorityBadge Component
 * 
 * Displays a formatted badge for ticket priority with appropriate color scheme
 * @param priority - The ticket priority level (Baixa, Média, Alta, Crítica)
 * @returns Chakra UI Badge component with priority-specific styling
 * 
 * @example
 * <PriorityBadge priority="Alta" />
 */
interface PriorityBadgeProps {
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
}

const priorityColors: Record<string, string> = {
  'Baixa': 'blue',
  'Média': 'yellow',
  'Alta': 'orange',
  'Crítica': 'red',
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <Badge colorScheme={priorityColors[priority]}>
      {priority}
    </Badge>
  )
}
