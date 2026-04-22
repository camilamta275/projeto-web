'use client'

import React from 'react'
import { VStack, HStack, Circle, Text, Box } from '@chakra-ui/react'
import type { TimelineEvent } from '@/types'
import { formatDateTime } from '@/utils/dateFormatter'

interface TimelineProps {
  events: TimelineEvent[]
}

const tipoIcons: Record<string, string> = {
  criacao: '📝',
  status: '🔄',
  mensagem: '💬',
  transferencia: '↔️',
  conclusao: '✅',
}

export function Timeline({ events }: TimelineProps) {
  return (
    <VStack align="stretch" spacing={4}>
      {events.map((event, index) => (
        <HStack key={event.id} align="flex-start" spacing={4}>
          {/* Timeline circle */}
          <VStack spacing={0} align="center" pt={1}>
            <Circle size="32px" bg="primary.500" color="white" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="lg">{tipoIcons[event.tipo] || '📌'}</Text>
            </Circle>
            {index < events.length - 1 && (
              <Box width="2px" height="40px" bg="gray.200" />
            )}
          </VStack>

          {/* Content */}
          <VStack align="start" spacing={0} flex={1} pb={2}>
            <Text fontWeight="bold" fontSize="sm">
              {event.descricao}
            </Text>
            <HStack spacing={2} opacity={0.6}>
              <Text fontSize="xs">{event.autor}</Text>
              <Text fontSize="xs">•</Text>
              <Text fontSize="xs">{event.data ? formatDateTime(event.data) : 'Data não disponível'}</Text>
            </HStack>
          </VStack>
        </HStack>
      ))}
    </VStack>
  )
}
