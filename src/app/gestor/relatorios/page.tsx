'use client'

import React from 'react'
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  SimpleGrid,
  Select,
  Button,
} from '@chakra-ui/react'

export default function RelatoriosPage() {
  const [filtroMes, setFiltroMes] = React.useState('atual')

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack align="start" spacing={2}>
          <Heading size="lg">Relatórios</Heading>
          <Text color="gray.500">Análise e estatísticas de chamados</Text>
        </VStack>

        {/* Filtros */}
        <HStack spacing={4}>
          <Select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            maxW="150px"
          >
            <option value="atual">Mês Atual</option>
            <option value="anterior">Mês Anterior</option>
            <option value="ultimos3">Últimos 3 Meses</option>
            <option value="ano">Ano Atual</option>
          </Select>
          <Button colorScheme="primary">Gerar PDF</Button>
          <Button variant="outline">Exportar Excel</Button>
        </HStack>

        {/* Gráficos */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Gráfico 1 */}
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="300px"
          >
            <VStack spacing={2} textAlign="center">
              <Text fontSize="2xl">📊</Text>
              <Heading size="sm">Status dos Chamados</Heading>
              <Text fontSize="xs" color="gray.500">
                Gráfico de pizza com distribuição de status
              </Text>
            </VStack>
          </Box>

          {/* Gráfico 2 */}
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="300px"
          >
            <VStack spacing={2} textAlign="center">
              <Text fontSize="2xl">📈</Text>
              <Heading size="sm">Tendência de Chamados</Heading>
              <Text fontSize="xs" color="gray.500">
                Gráfico de linha com evolução temporal
              </Text>
            </VStack>
          </Box>

          {/* Tabela 1 */}
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
            minH="300px"
          >
            <Heading size="sm" mb={4}>
              Top Categorias
            </Heading>
            <VStack align="start" spacing={2} fontSize="sm">
              <HStack justify="space-between" width="100%">
                <Text fontWeight="bold">Categoria</Text>
                <Text fontWeight="bold">Total</Text>
              </HStack>
              <Text opacity={0.5}>Carregando dados...</Text>
            </VStack>
          </Box>

          {/* Tabela 2 */}
          <Box
            bg="white"
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            border="1px"
            borderColor="gray.200"
            minH="300px"
          >
            <Heading size="sm" mb={4}>
              Performance por Órgão
            </Heading>
            <VStack align="start" spacing={2} fontSize="sm">
              <HStack justify="space-between" width="100%">
                <Text fontWeight="bold">Órgão</Text>
                <Text fontWeight="bold">Resolvidos</Text>
              </HStack>
              <Text opacity={0.5}>Carregando dados...</Text>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Resumo */}
        <Box bg="green.50" p={6} borderRadius="lg" borderLeft="4px" borderColor="green.500">
          <Heading size="sm" mb={2}>
            Resumo do Período
          </Heading>
          <SimpleGrid columns={4} spacing={4}>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Total
              </Text>
              <Text fontSize="lg" fontWeight="bold">
                0
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Resolvidos
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="green.600">
                0
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Em Aberto
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                0
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">
                SLA Vencido
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="red.600">
                0
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  )
}
