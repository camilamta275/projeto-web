'use client'

import React from 'react'
import { Box, Text, VStack, HStack, Progress, Badge } from '@chakra-ui/react'
import type { Chamado } from '@/types'

interface ChamadoCardProps {
  chamado: Chamado
  onClick?: () => void
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

const categoryIcons: Record<string, string> = {
  'Problemas na Via': '🛣️',
  'Água e Esgoto': '💧',
  'Iluminação Pública': '💡',
  'Saneamento Básico': '🧹',
  Sinalização: '🚦',
}

export function ChamadoCard({ chamado, onClick }: ChamadoCardProps) {
  // Calcular progresso SLA
  const slaProgress = Math.min(100, (chamado.slaEncerradoHa ? 0 : 50))

  // Determinar cor da barra SLA
  const slaColor = chamado.slaEncerradoHa ? 'red' : 'green'

  const timeAgo = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60))
      return `há ${mins}m`
    }
    if (hours < 24) return `há ${hours}h`

    const days = Math.floor(hours / 24)
    return `há ${days}d`
  }

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      p={4}
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{
        boxShadow: 'md',
        transform: 'translateY(-2px)',
        borderColor: 'primary.300',
      }}
    >
      {/* Header */}
      <HStack justify="space-between" align="start" mb={3}>
        <HStack spacing={2} flex={1}>
          <Text fontSize="xl">{categoryIcons[chamado.categoria] || '📝'}</Text>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="sm">
              {chamado.protocolo}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {chamado.categoria}
            </Text>
          </VStack>
        </HStack>
        <Badge colorScheme={statusColors[chamado.status]} fontSize="xs">
          {chamado.status}
        </Badge>
      </HStack>

      {/* Descrição */}
      <Text fontSize="sm" noOfLines={2} mb={3} color="gray.700">
        {chamado.descricao}
      </Text>

      {/* Endereço e tempo */}
      <HStack spacing={2} fontSize="xs" color="gray.500" mb={3}>
        <Text noOfLines={1}>📍 {chamado.endereco}</Text>
        <Text>•</Text>
        <Text>{timeAgo(chamado.atualizadoEm)}</Text>
      </HStack>

      {/* SLA Progress Bar */}
      <VStack align="start" spacing={1} mb={3}>
        <HStack justify="space-between" width="100%" fontSize="xs">
          <HStack spacing={2}>
            <Badge colorScheme={prioridadeColors[chamado.prioridade]} variant="solid">
              {chamado.prioridade}
            </Badge>
            <Text fontWeight="bold">{chamado.slaHoras}h SLA</Text>
          </HStack>
          {chamado.slaEncerradoHa && chamado.slaEncerradoHa < 0 && (
            <Text color="red.600" fontWeight="bold">
              Vencido há {Math.abs(chamado.slaEncerradoHa)}h
            </Text>
          )}
        </HStack>
        <Progress
          value={slaProgress}
          size="sm"
          colorScheme={slaColor}
          borderRadius="full"
          width="100%"
        />
      </VStack>

      {/* Órgão responsável */}
    </Box>
  )
}

export { ChamadoCard as ChamadoCardV2 }
