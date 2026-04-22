import React from 'react'
import { VStack, HStack, Text, Box } from '@chakra-ui/react'

/**
 * TimelineEvent Component
 * 
 * Renders a single event in a vertical timeline with icon and details
 * Used in ticket detail pages to show status history
 * 
 * @param event - Event data with type, title, description, user, and timestamp
 * @returns VStack with event details
 * 
 * @example
 * <TimelineEvent
 *   event={{
 *     tipo: 'status',
 *     titulo: 'Status Atualizado',
 *     descricao: 'Mudança para Em Andamento',
 *     usuario: 'João Silva',
 *     timestamp: '2026-04-21 10:30'
 *   }}
 * />
 */
interface TimelineEventProps {
  tipo: 'criacao' | 'status' | 'mensagem' | 'transferencia' | 'conclusao'
  titulo?: string
  descricao: string
  usuario?: string
  timestamp: string
}

const eventIcons: Record<string, string> = {
  criacao: '📝',
  status: '🔄',
  mensagem: '💬',
  transferencia: '↪️',
  conclusao: '✅',
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({
  tipo,
  titulo,
  descricao,
  usuario,
  timestamp,
}) => {
  return (
    <VStack align="start" spacing={1} pb={4} position="relative">
      {/* Icon and title */}
      <HStack spacing={2} width="100%">
        <Text fontSize="xl">{eventIcons[tipo]}</Text>
        <VStack align="start" spacing={0} flex={1}>
          <Text fontSize="sm" fontWeight="bold">
            {titulo || tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {timestamp}
            {usuario && ` • ${usuario}`}
          </Text>
        </VStack>
      </HStack>

      {/* Description */}
      <Text fontSize="sm" color="gray.700" ml={9}>
        {descricao}
      </Text>

      {/* Divider line */}
      <Box
        position="absolute"
        left="15px"
        top="28px"
        width="2px"
        height="40px"
        bg="gray.200"
      />
    </VStack>
  )
}
