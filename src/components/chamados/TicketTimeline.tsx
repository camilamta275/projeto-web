'use client'

import React from 'react'
import { VStack, HStack, Circle, Text, Box } from '@chakra-ui/react'
import type { TimelineEvent } from '@/types'

interface TicketTimelineProps {
  events: TimelineEvent[]
}

const tipoIcons: Record<string, string> = {
  criacao: '📝',
  status: '🔄',
  mensagem: '💬',
  transferencia: '↔️',
  conclusao: '✅',
}

export function TicketTimeline({ events }: TicketTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <Text color="muted.foreground" fontSize="sm">
        Sem eventos registrados
      </Text>
    )
  }

  return (
    <VStack align="stretch" spacing={4}>
      {events.map((event, index) => (
        <HStack key={event.id} align="flex-start" spacing={4}>
          <VStack spacing={0} align="center" pt={1} flexShrink={0}>
            <Circle size="32px" bg="primary.500" color="white">
              <Text fontSize="sm">{tipoIcons[event.tipo] ?? '📌'}</Text>
            </Circle>
            {index < events.length - 1 && (
              <Box w="2px" h="40px" bg="border" />
            )}
          </VStack>

          <VStack align="start" spacing={1} flex={1} pb={2}>
            <Text fontWeight="semibold" fontSize="sm">
              {event.titulo ?? (event.tipo.charAt(0).toUpperCase() + event.tipo.slice(1))}
            </Text>
            <Text
              fontSize="sm"
              color={event.tipo === 'mensagem' ? 'primary.500' : 'muted.foreground'}
              fontStyle={event.tipo === 'mensagem' ? 'italic' : 'normal'}
            >
              {event.descricao}
            </Text>
            <HStack spacing={1}>
              {(event.autor || event.usuario) && (
                <Text fontSize="xs" color="muted.foreground">
                  {event.autor ?? event.usuario}
                </Text>
              )}
              {(event.autor || event.usuario) && (event.data || event.timestamp) && (
                <Text fontSize="xs" color="muted.foreground">•</Text>
              )}
              {(event.data || event.timestamp) && (
                <Text fontSize="xs" color="muted.foreground">
                  {new Date(event.timestamp ?? event.data ?? '').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </HStack>
          </VStack>
        </HStack>
      ))}
    </VStack>
  )
}
