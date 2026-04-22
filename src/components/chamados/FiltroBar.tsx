'use client'

import React from 'react'
import { HStack, Input, Select, Button, Box } from '@chakra-ui/react'
import type { StatusChamado } from '@/types'

interface FiltroChamados {
  busca?: string
  status?: StatusChamado
  prioridade?: string
}

interface FiltroBarProps {
  onFiltrar: (filtros: FiltroChamados) => void
  isLoading?: boolean
}

const statuses: StatusChamado[] = [
  'Aberto',
  'Em Análise',
  'Em Andamento',
  'Aguardando',
  'Resolvido',
  'Fechado',
]

const prioridades = ['Baixa', 'Média', 'Alta', 'Crítica']

export function FiltroBar({ onFiltrar, isLoading = false }: FiltroBarProps) {
  const [filtros, setFiltros] = React.useState<FiltroChamados>({})

  const handleAplicar = () => {
    onFiltrar(filtros)
  }

  const handleLimpar = () => {
    setFiltros({})
    onFiltrar({})
  }

  return (
    <Box bg="gray.50" p={4} borderRadius="lg" mb={4}>
      <HStack spacing={3} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        <Input
          placeholder="Buscar protocolo ou endereço..."
          value={filtros.busca || ''}
          onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
          flex={1}
          minW="150px"
        />

        <Select
          placeholder="Status"
          value={filtros.status || ''}
          onChange={(e) =>
            setFiltros({
              ...filtros,
              status: (e.target.value as StatusChamado) || undefined,
            })
          }
          minW="120px"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          placeholder="Prioridade"
          value={filtros.prioridade || ''}
          onChange={(e) =>
            setFiltros({ ...filtros, prioridade: e.target.value || undefined })
          }
          minW="120px"
        >
          {prioridades.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>

        <Button
          colorScheme="primary"
          onClick={handleAplicar}
          isLoading={isLoading}
          minW="100px"
        >
          Filtrar
        </Button>

        <Button variant="ghost" onClick={handleLimpar}>
          Limpar
        </Button>
      </HStack>
    </Box>
  )
}
