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
import type { Chamado } from '@/types'

interface ChamadoCardProps {
  chamado: Chamado
}

const statusColors: Record<string, string> = {
  Aberto: 'blue',
  'Em Análise': 'yellow',
  'Em Andamento': 'purple',
  Aguardando: 'orange',
  Resolvido: 'green',
  Fechado: 'gray',
}

const prioridadeColors: Record<string, string> = {
  Baixa: 'green',
  Média: 'yellow',
  Alta: 'orange',
  Crítica: 'red',
}

export function ChamadoCard({ chamado }: ChamadoCardProps) {
  return (
    <Card cursor="pointer" _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start" mb={2}>
          <VStack align="start" spacing={1} flex={1}>
            <Heading size="sm">{chamado.protocolo}</Heading>
            <Text fontSize="xs" color="gray.500">
              {chamado.categoria}
            </Text>
          </VStack>
          <HStack spacing={1}>
            <Badge colorScheme={statusColors[chamado.status]} fontSize="xs">
              {chamado.status}
            </Badge>
            <Badge colorScheme={prioridadeColors[chamado.prioridade]} fontSize="xs">
              {chamado.prioridade}
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack align="start" spacing={3}>
          <Text fontSize="sm" noOfLines={2}>
            {chamado.descricao}
          </Text>

          <HStack justify="space-between" width="100%" fontSize="xs" color="gray.500">
            <Text>{chamado.endereco}</Text>
            <Text>SLA: {chamado.slaHoras}h</Text>
          </HStack>

          <Link href={`/cidadao/chamados/${chamado.id}`}>
            <Button size="sm" colorScheme="primary" variant="ghost" width="100%">
              Ver Detalhes
            </Button>
          </Link>
        </VStack>
      </CardBody>
    </Card>
  )
}
