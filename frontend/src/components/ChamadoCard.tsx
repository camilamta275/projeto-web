import React from 'react'
import { Card, CardBody, VStack, HStack, Text, Image, Box } from '@chakra-ui/react'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * ChamadoCard Component
 * 
 * Displays a ticket card for citizen dashboard with key information and visual indicators
 * Shows SLA status via color bar, status/priority badges, and time-ago formatting
 * 
 * @param chamado - Ticket object with all required fields
 * @param onClick - Optional callback when card is clicked
 * @returns Complete ticket card component
 * 
 * @example
 * <ChamadoCard 
 *   chamado={chamadoObject} 
 *   onClick={() => navigate(`/cidadao/chamados/${chamadoObject.id}`)}
 * />
 */
interface Chamado {
  id: string
  protocolo: string
  categoria: string
  subcategoria: string
  descricao: string
  status: string
  prioridade: string
  endereco: string
  foto?: string
  slaRestante: number
  slaHoras: number
  timestamp: string
}

interface ChamadoCardProps {
  chamado: Chamado
  onClick?: () => void
}

const categoryEmojis: Record<string, string> = {
  'Via': '🛣️',
  'Água': '💧',
  'Energia': '💡',
  'Saneamento': '🧹',
  'Trânsito': '🚦',
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({ chamado, onClick }) => {
  const categoryEmoji = categoryEmojis[chamado.categoria] || '📋'
  const timeAgo = formatDistanceToNow(new Date(chamado.timestamp), { locale: ptBR, addSuffix: true })

  return (
    <Card
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { transform: 'scale(1.02)', boxShadow: 'md' } : {}}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack align="start" spacing={3}>
          {/* Header */}
          <HStack justify="space-between" width="100%">
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.600" fontWeight="bold">
                {categoryEmoji} {chamado.categoria}
              </Text>
              <Text fontFamily="monospace" fontWeight="bold" fontSize="sm">
                {chamado.protocolo}
              </Text>
            </VStack>
            <HStack spacing={1}>
              <StatusBadge status={chamado.status as any} />
              <PriorityBadge priority={chamado.prioridade as any} />
            </HStack>
          </HStack>

          {/* Photo if available */}
          {chamado.foto && (
            <Image
              src={chamado.foto}
              alt="Foto do chamado"
              width="100%"
              height="150px"
              objectFit="cover"
              borderRadius="md"
            />
          )}

          {/* Description */}
          <Text fontSize="sm" noOfLines={2} color="gray.700">
            {chamado.descricao}
          </Text>

          {/* Location and Time */}
          <HStack spacing={2} fontSize="xs" color="gray.600" width="100%">
            <Text>📍 {chamado.endereco}</Text>
            <Box flex={1} />
            <Text>{timeAgo}</Text>
          </HStack>

          {/* SLA Indicator */}
          <Box width="100%">
            <Box
              height="6px"
              bg={chamado.slaRestante < 0 ? 'red.500' : 'green.500'}
              borderRadius="full"
              mb={1}
            />
            <Text fontSize="xs" fontWeight="bold" color={chamado.slaRestante < 0 ? 'red.600' : 'green.600'}>
              {chamado.slaRestante < 0 
                ? `❌ Vencido há ${Math.abs(chamado.slaRestante)}h` 
                : `✓ ${chamado.slaRestante}h restantes`}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  )
}
