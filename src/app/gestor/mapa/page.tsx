'use client'

import React from 'react'
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  useColorMode,
} from '@chakra-ui/react'

export default function MapaPage() {
  const { colorMode } = useColorMode()

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={4} align="stretch">
        <Heading size="lg">Mapa de Chamados</Heading>

        <Box
          width="100%"
          height="600px"
          borderRadius="lg"
          bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
          border="2px"
          borderColor="gray.300"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack spacing={2} textAlign="center">
            <Text fontSize="2xl">🗺️</Text>
            <Heading size="md">Mapa Integrado</Heading>
            <Text color="gray.500" fontSize="sm">
              Integrando Google Maps ou Leaflet para visualizar chamados por localização
            </Text>
          </VStack>
        </Box>

        <Box bg="blue.50" p={4} borderRadius="lg" fontSize="sm">
          <Text>
            <strong>Em desenvolvimento:</strong> Visualização de chamados em mapa com filtros
            de status, prioridade e SLA. Clique no marcador para ver detalhes e ações.
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}
