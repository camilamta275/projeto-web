'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Divider,
  Spinner,
  
} from '@chakra-ui/react'
import { SearchIcon, BellIcon } from '@chakra-ui/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useGestorStore } from '@/stores/gestorStore'
import { useAuthStore } from '@/stores/authStore'

interface GraficoData {
  categoria: string
  sla: number
  color: string
}

interface Alerta {
  id: string
  protocolo: string
  categoria: string
  status: string
  slaHoras: number
  slaRestante: number
  prioridade: string
}

const graficoData: GraficoData[] = [
  { categoria: 'Via', sla: 85, color: '#22c55e' },
  { categoria: 'Água', sla: 72, color: '#eab308' },
  { categoria: 'Energia', sla: 58, color: '#ef4444' },
  { categoria: 'Saneamento', sla: 92, color: '#22c55e' },
  { categoria: 'Trânsito', sla: 68, color: '#eab308' },
]

const alertas: Alerta[] = [
  {
    id: '1',
    protocolo: 'SCH-2026-0142',
    categoria: 'Água e Esgoto',
    status: 'Em Análise',
    slaHoras: 48,
    slaRestante: -3,
    prioridade: 'Alta',
  },
  {
    id: '2',
    protocolo: 'SCH-2026-0135',
    categoria: 'Energia e Iluminação',
    status: 'Aberto',
    slaHoras: 72,
    slaRestante: -8,
    prioridade: 'Crítica',
  },
  {
    id: '3',
    protocolo: 'SCH-2026-0128',
    categoria: 'Problemas na Via',
    status: 'Em Andamento',
    slaHoras: 48,
    slaRestante: 6,
    prioridade: 'Média',
  },
  {
    id: '4',
    protocolo: 'SCH-2026-0121',
    categoria: 'Saneamento Básico',
    status: 'Aguardando',
    slaHoras: 24,
    slaRestante: -12,
    prioridade: 'Alta',
  },
  {
    id: '5',
    protocolo: 'SCH-2026-0115',
    categoria: 'Trânsito e Segurança',
    status: 'Em Análise',
    slaHoras: 36,
    slaRestante: 2,
    prioridade: 'Média',
  },
  {
    id: '6',
    protocolo: 'SCH-2026-0108',
    categoria: 'Água e Esgoto',
    status: 'Em Andamento',
    slaHoras: 48,
    slaRestante: -5,
    prioridade: 'Alta',
  },
]

export default function GestorDashboardPage() {
  const { usuario } = useAuthStore()
  const { metricas, loading, fetchMetricas } = useGestorStore()
  // const [isDesktop] = useMediaQuery('(min-width: 768px)')

  React.useEffect(() => {
    if (usuario?.orgaoId) {
      fetchMetricas(usuario.orgaoId)
    }
  }, [usuario?.orgaoId, fetchMetricas])

  const kpis = [
    {
      label: 'Total de Chamados',
      value: metricas?.totalChamados || 156,
      change: -12,
      icon: '📋',
      color: 'blue',
      bgColor: 'blue.50',
    },
    {
      label: 'Em Aberto',
      value: metricas?.chamadosAbertos || 24,
      icon: '📭',
      color: 'orange',
      bgColor: 'orange.50',
    },
    {
      label: 'SLA Encerrado',
      value: metricas?.slaVencido || 8,
      isAlert: true,
      icon: '⚠️',
      color: 'red',
      bgColor: 'red.50',
    },
    {
      label: 'Concluídos',
      value: (metricas?.totalChamados || 156) - (metricas?.chamadosAbertos || 24),
      change: 8,
      icon: '✅',
      color: 'green',
      bgColor: 'green.50',
    },
  ]

  const alertasVencidos = alertas.filter((a) => a.slaRestante < 0)

  if (loading) {
    return (
      <Container maxW="100%" py={12} display="flex" justifyContent="center">
        <Spinner size="lg" color="primary.500" />
      </Container>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box bg="white" borderBottomWidth="1px" borderBottomColor="gray.200" py={4} px={4}>
        <Container maxW="100%" pr={4}>
          <HStack justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold" color="primary.700">
              📊 Dashboard Gestor
            </Text>

            <HStack spacing={4}>
              <InputGroup maxW="300px" display={{ base: 'none', md: 'flex' }}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input placeholder="Buscar protocolo..." size="sm" />
              </InputGroup>

              <HStack spacing={3}>
                <Box position="relative">
                  <Button size="sm" variant="ghost" borderRadius="full">
                    <BellIcon boxSize={5} />
                  </Button>
                  <Badge position="absolute" top="-1" right="-1" colorScheme="red" borderRadius="full">
                    {alertasVencidos.length}
                  </Badge>
                </Box>

                <HStack spacing={2} borderLeftWidth="1px" borderLeftColor="gray.200" pl={3}>
                  <Avatar size="sm" name="João Silva" bg="primary.500" />
                  <VStack align="start" spacing={0} display={{ base: 'none', md: 'flex' }}>
                    <Text fontSize="xs" fontWeight="bold">
                      João Silva
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Gestor
                    </Text>
                  </VStack>
                </HStack>
              </HStack>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="100%" pr={4} py={6}>
        <VStack spacing={6} align="stretch">
          {/* KPI Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {kpis.map((kpi, idx) => (
              <Card key={idx} bg={kpi.bgColor} borderWidth="1px" borderColor={`${kpi.color}.200`}>
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="2xl">{kpi.icon}</Text>
                      {kpi.change && (
                        <Badge colorScheme={kpi.change > 0 ? 'green' : 'red'}>
                          {kpi.change > 0 ? '+' : ''}{kpi.change}%
                        </Badge>
                      )}
                    </HStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xs" color="gray.600" fontWeight="bold">
                        {kpi.label}
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={`${kpi.color}.700`}>
                        {kpi.value}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <Divider />

          {/* Gráfico de SLA por Categoria */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4} width="100%">
                <HStack justify="space-between" width="100%">
                  <Heading size="md">📊 SLA por Categoria</Heading>
                  <Text fontSize="xs" color="gray.600">
                    Percentual de atendimento dentro do SLA
                  </Text>
                </HStack>

                <Box width="100%" height="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graficoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => `${value}%`}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                      <Bar dataKey="sla" radius={[8, 8, 0, 0]}>
                        {graficoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>

                {/* Legenda de Cores */}
                <HStack spacing={4} fontSize="xs" flexWrap="wrap">
                  <HStack>
                    <Box width="12px" height="12px" bg="green.500" borderRadius="2px" />
                    <Text>Excelente (≥80%)</Text>
                  </HStack>
                  <HStack>
                    <Box width="12px" height="12px" bg="yellow.500" borderRadius="2px" />
                    <Text>Bom (66-79%)</Text>
                  </HStack>
                  <HStack>
                    <Box width="12px" height="12px" bg="red.500" borderRadius="2px" />
                    <Text>Crítico (&lt;66%)</Text>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Divider />

          {/* Mapa de Calor Placeholder */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4} width="100%">
                <Heading size="md">🗺️ Mapa de Calor de Chamados</Heading>
                <Box
                  width="100%"
                  height="300px"
                  bg="gray.200"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="gray.600"
                >
                  <Text textAlign="center">
                    Integração com Leaflet/Google Maps
                    <br />
                    <Text fontSize="xs" mt={2}>
                      Exibindo densidade de chamados por região de Recife
                    </Text>
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Divider />

          {/* Tabela de Alertas */}
          <Card borderTopWidth="3px" borderTopColor="red.500">
            <CardBody>
              <VStack align="start" spacing={4} width="100%">
                <HStack>
                  <Heading size="md">🚨 Alertas — SLA Encerrado</Heading>
                  <Badge colorScheme="red">{alertasVencidos.length} Críticos</Badge>
                </HStack>

                <Box overflowX="auto" width="100%">
                  <Table size="sm">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th>Protocolo</Th>
                        <Th>Categoria</Th>
                        <Th>Status</Th>
                        <Th>Prioridade</Th>
                        <Th>SLA</Th>
                        <Th>Ação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {alertas.slice(0, 6).map((alerta) => (
                        <Tr
                          key={alerta.id}
                          bg={alerta.slaRestante < 0 ? 'red.50' : 'white'}
                          _hover={{ bg: alerta.slaRestante < 0 ? 'red.100' : 'gray.50' }}
                        >
                          <Td fontWeight="bold" fontFamily="monospace" fontSize="xs">
                            {alerta.protocolo}
                          </Td>
                          <Td fontSize="sm">{alerta.categoria}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                alerta.status === 'Aberto'
                                  ? 'blue'
                                  : alerta.status === 'Em Análise'
                                    ? 'yellow'
                                    : alerta.status === 'Em Andamento'
                                      ? 'purple'
                                      : 'orange'
                              }
                            >
                              {alerta.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme={alerta.prioridade === 'Crítica' ? 'red' : 'orange'}>
                              {alerta.prioridade}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <Box
                                width="20px"
                                height="6px"
                                bg={alerta.slaRestante < 0 ? 'red.500' : 'orange.500'}
                                borderRadius="full"
                              />
                              <Text fontSize="xs" color={alerta.slaRestante < 0 ? 'red.600' : 'orange.600'}>
                                {alerta.slaRestante < 0 ? '❌' : '⚠️'} {Math.abs(alerta.slaRestante)}h
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Button size="xs" colorScheme="primary" variant="outline">
                              Ver
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                <Text fontSize="xs" color="gray.600" textAlign="center" width="100%">
                  Mostrando {Math.min(6, alertas.length)} de {alertas.length} chamados com SLA crítico
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}


