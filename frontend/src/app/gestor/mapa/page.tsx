'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  Box, Container, VStack, HStack, Heading, Text, Select, 
  Card, Badge, Spinner
} from '@chakra-ui/react'

// Importação dinâmica do componente de Mapa para evitar erro de SSR
const HeatmapComponent = dynamic(() => import('@/components/Heatmap'), { 
  ssr: false,
  loading: () => (
    <Box height="600px" display="flex" alignItems="center" justifyContent="center" bg="gray.100" borderRadius="lg">
      <VStack>
        <Spinner size="xl" color="blue.500" />
        <Text>Carregando camadas do mapa...</Text>
      </VStack>
    </Box>
  )
})

// Mocks com coordenadas reais de Recife para o Heatmap
const MOCK_MAPA = [
  { id: '1', lat: -8.058, lng: -34.872, status: 'Aberto', prioridade: 'Alta', categoria: 'Água' },
  { id: '2', lat: -8.063, lng: -34.874, status: 'Em Análise', prioridade: 'Crítica', categoria: 'Energia' },
  { id: '3', lat: -8.059, lng: -34.882, status: 'Aberto', prioridade: 'Média', categoria: 'Via' },
  { id: '4', lat: -8.045, lng: -34.895, status: 'Em Andamento', prioridade: 'Alta', categoria: 'Saneamento' },
  { id: '5', lat: -8.050, lng: -34.900, status: 'Aberto', prioridade: 'Baixa', categoria: 'Iluminação' },
  { id: '6', lat: -8.060, lng: -34.870, status: 'Aberto', prioridade: 'Crítica', categoria: 'Via' },
]

export default function MapaPage() {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')

  // ✅ Filtra os dados que serão enviados para o componente de mapa
  const pontosFiltrados = useMemo(() => {
    return MOCK_MAPA.filter(p => {
      const matchStatus = filtroStatus === 'todos' || p.status === filtroStatus
      const matchPrioridade = filtroPrioridade === 'todas' || p.prioridade === filtroPrioridade
      return matchStatus && matchPrioridade
    })
  }, [filtroStatus, filtroPrioridade])

  // Formata para o padrão [lat, lng, intensidade] exigido pelo Leaflet.heat
  const heatmapData: [number, number, number][] = useMemo(() => {
    return pontosFiltrados.map(p => [
      p.lat, 
      p.lng, 
      p.prioridade === 'Crítica' ? 1.0 : 0.6 // Intensidade baseada na prioridade
    ])
  }, [pontosFiltrados])

  return (
    <Container maxW="100%" py={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" flexWrap="wrap" spacing={4}>
          <Box>
            <Heading size="lg">🗺️ Mapa de Calor de Incidentes</Heading>
            <Text color="gray.600">Visualize as áreas com maior concentração de chamados</Text>
          </Box>
          
          <HStack spacing={3}>
            <Select 
              size="sm" 
              w="180px" 
              bg="white" 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos os Status</option>
              <option value="Aberto">Abertos</option>
              <option value="Em Andamento">Em Andamento</option>
            </Select>

            <Select 
              size="sm" 
              w="180px" 
              bg="white" 
              value={filtroPrioridade} 
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            >
              <option value="todas">Todas Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </Select>
            
            <Badge colorScheme="blue" p={2} borderRadius="md">
              {pontosFiltrados.length} pontos no mapa
            </Badge>
          </HStack>
        </HStack>

        <Card shadow="md" overflow="hidden" borderRadius="xl" border="1px solid" borderColor="gray.200">
          <Box height="650px" position="relative">
            <HeatmapComponent data={heatmapData} />
          </Box>
        </Card>

        <HStack spacing={4}>
          <Box p={3} bg="orange.50" borderRadius="md" flex={1} borderLeft="4px solid" borderColor="orange.400">
            <Text fontSize="xs" fontWeight="bold" color="orange.800">LEGENDA DE INTENSIDADE</Text>
            <Text fontSize="xs">Áreas em <strong>vermelho</strong> indicam chamados Críticos ou Alta concentração.</Text>
          </Box>
          <Box p={3} bg="blue.50" borderRadius="md" flex={1} borderLeft="4px solid" borderColor="blue.400">
            <Text fontSize="xs" fontWeight="bold" color="blue.800">DICA DE USO</Text>
            <Text fontSize="xs">Use o scroll para zoom. O calor se ajusta automaticamente ao nível de proximidade.</Text>
          </Box>
        </HStack>
      </VStack>
    </Container>
  )
}