import React from 'react'
import { Tr, Td, HStack, Box, Text, Button } from '@chakra-ui/react'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

/**
 * FilaChamadoRow Component
 * 
 * Renders a single row in the manager ticket queue table
 * Includes checkbox support, SLA indicator, and action buttons
 * 
 * @param chamado - Ticket data for the row
 * @param isSelected - Whether the checkbox is checked
 * @param onSelectChange - Callback for checkbox change
 * @param onAssume - Callback for "Assume" button
 * @param onView - Callback for "View" button
 * @returns TableRow component
 * 
 * @example
 * <FilaChamadoRow
 *   chamado={chamado}
 *   isSelected={true}
 *   onSelectChange={() => {}}
 *   onAssume={() => {}}
 *   onView={() => {}}
 * />
 */
interface Chamado {
  id: string
  protocolo: string
  categoria: string
  endereco: string
  prioridade: string
  status: string
  slaRestante: number
}

interface FilaChamadoRowProps {
  chamado: Chamado
  isSelected: boolean
  onSelectChange: (id: string) => void
  onAssume?: () => void
  onView?: () => void
}

export const FilaChamadoRow: React.FC<FilaChamadoRowProps> = ({
  chamado,
  isSelected,
  onSelectChange,
  onAssume,
  onView,
}) => {
  return (
    <Tr
      bg={isSelected ? 'blue.50' : 'white'}
      _hover={{ bg: isSelected ? 'blue.100' : 'gray.50' }}
    >
      <Td width="40px">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectChange(chamado.id)}
        />
      </Td>
      <Td fontWeight="bold" fontFamily="monospace" fontSize="xs">
        {chamado.protocolo}
      </Td>
      <Td fontSize="sm">{chamado.categoria}</Td>
      <Td fontSize="sm" maxW="200px" isTruncated title={chamado.endereco}>
        {chamado.endereco}
      </Td>
      <Td>
        <PriorityBadge priority={chamado.prioridade as any} />
      </Td>
      <Td>
        <StatusBadge status={chamado.status as any} />
      </Td>
      <Td>
        <HStack spacing={1}>
          <Box
            width="16px"
            height="4px"
            bg={chamado.slaRestante < 0 ? 'red.500' : 'green.500'}
            borderRadius="full"
          />
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={chamado.slaRestante < 0 ? 'red.600' : 'green.600'}
          >
            {chamado.slaRestante < 0
              ? `❌ ${Math.abs(chamado.slaRestante)}h`
              : `✓ ${chamado.slaRestante}h`}
          </Text>
        </HStack>
      </Td>
      <Td>
        <HStack spacing={1}>
          {onAssume && (
            <Button size="xs" colorScheme="primary" onClick={onAssume}>
              Assumir
            </Button>
          )}
          {onView && (
            <Button size="xs" variant="outline" onClick={onView}>
              Ver
            </Button>
          )}
        </HStack>
      </Td>
    </Tr>
  )
}
