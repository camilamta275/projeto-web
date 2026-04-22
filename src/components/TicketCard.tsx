'use client'

import React from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
} from '@chakra-ui/react'
import Link from 'next/link'
import { Ticket, CategoriaChamado } from '@/types'
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_COLORS, TICKET_STATUS_COLORS } from '@/utils/constants'
import { formatTimeAgo } from '@/utils/dateFormatter'

interface TicketCardProps {
  ticket: Ticket
  onClick?: (ticket: Ticket) => void
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  return (
    <Card
      cursor="pointer"
      _hover={{ boxShadow: 'lg' }}
      transition="all 0.2s"
      onClick={() => onClick?.(ticket)}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" flex={1} spacing={1}>
            <Heading size="md">{ticket.descricao}</Heading>
            <Text fontSize="sm" color="gray.500">
              {ticket.endereco}
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Badge colorScheme={TICKET_PRIORITY_COLORS[ticket.prioridade]}>
              {ticket.prioridade.toUpperCase()}
            </Badge>
            <Badge colorScheme={TICKET_STATUS_COLORS[ticket.status]}>
              {ticket.status.toUpperCase()}
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody pt={2}>
        <VStack align="start" spacing={3}>
          <Text fontSize="sm" noOfLines={2}>
            {ticket.descricao}
          </Text>

          <HStack spacing={2} width="100%">
            <Badge variant="subtle">
              {TICKET_CATEGORY_LABELS[ticket.categoria as CategoriaChamado]}
            </Badge>
          </HStack>

          <HStack justify="space-between" width="100%" pt={2}>
            <Text fontSize="xs" color="gray.500">
              {formatTimeAgo(ticket.criadoEm)}
            </Text>
            <Link href={`/cidadao/chamados/${ticket.id}`}>
              <Button size="sm" colorScheme="primary" variant="ghost">
                Ver Detalhes
              </Button>
            </Link>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
