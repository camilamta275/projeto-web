'use client'

import React, { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Box, Container, VStack, HStack, Heading, Text, SimpleGrid, Card, CardBody,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Input, InputGroup,
  InputLeftElement, Avatar, Spinner, IconButton, Menu, MenuButton,
  MenuList, MenuItem, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Select,
} from '@chakra-ui/react'
import { SearchIcon, BellIcon } from '@chakra-ui/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useGestorStore } from '@/stores/gestorStore'
import { useAuthStore } from '@/stores/authStore'

const Heatmap = dynamic(() => import('@/components/Heatmap'), {
  ssr: false,
  loading: () => (
    <Box height="300px" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
      <Spinner color="blue.500" />
      <Text ml={3}>Carregando Mapa...</Text>
    </Box>
  ),
})

export default function GestorDashboardPage() {
  const { usuario } = useAuthStore()
  const { metricas, chamadosFila, loading, fetchMetricas, fetchFilaChamados } = useGestorStore()

  const [slaFilter, setSlaFilter]     = useState<'todos' | 'vencidos' | 'no_prazo'>('todos')
  const [busca, setBusca]             = useState('')
  const [selectedAlerta, setSelectedAlerta] = useState<any | null>(null)
  const { isOpen, onOpen, onClose }   = useDisclosure()

  useEffect(() => {
    if (!usuario) return
    fetchMetricas(usuario.orgaoId ?? '')
    fetchFilaChamados()
  }, [usuario?.id])

  const agora = new Date().getTime()

  const alertasProcessados = useMemo(() => {
    const buscaLower = busca.toLowerCase()

    return chamadosFila
      .map((t) => {
        const deadline   = t.slaDeadline ? new Date(t.slaDeadline).getTime() : agora
        const slaRestante = Math.floor((deadline - agora) / 3_600_000)
        return { ...t, slaRestante }
      })
      .filter((t) => {
        if (slaFilter === 'vencidos'  && t.slaRestante >= 0) return false
        if (slaFilter === 'no_prazo'  && t.slaRestante < 0)  return false
        if (busca && !t.protocolo.toLowerCase().includes(buscaLower) &&
            !t.endereco.toLowerCase().includes(buscaLower)) return false
        return true
      })
  }, [chamadosFila, slaFilter, busca])

  const alertasVencidos = useMemo(
    () => alertasProcessados.filter((a) => a.slaRestante < 0),
    [alertasProcessados],
  )

  const heatmapData: [number, number, number][] = useMemo(
    () => alertasProcessados
      .filter((t) => t.latitude && t.longitude)
      .map((t) => [t.latitude, t.longitude, 1.0]),
    [alertasProcessados],
  )

  const graficoData = useMemo(
    () => (metricas?.demandasPorCategoria ?? [])
      .filter((d) => d.total > 0)
      .map((d, i) => ({
        categoria: d.category,
        total: d.total,
        color: ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'][i % 6],
      })),
    [metricas?.demandasPorCategoria],
  )

  const kpis = [
    { label: 'Total do Órgão',  value: metricas?.totalChamados ?? 0,    icon: '📋', color: 'blue',   bgColor: 'blue.50'   },
    { label: 'Em Aberto',       value: metricas?.chamadosAbertos ?? 0,   icon: '📭', color: 'orange', bgColor: 'orange.50' },
    { label: 'SLA Vencido',     value: alertasVencidos.length,           icon: '⚠️', color: 'red',    bgColor: 'red.50'    },
    { label: 'Concluídos',      value: metricas?.chamadosEncerrados ?? 0, icon: '✅', color: 'green',  bgColor: 'green.50'  },
  ]

  if (loading && !metricas && chamadosFila.length === 0) {
    return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" /></Box>
  }

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Header */}
      <Box bg="white" borderBottomWidth="1px" py={4} px={4} position="sticky" top={0} zIndex={1100}>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold" color="blue.700">📊 Dashboard Gestor</Text>
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement><SearchIcon color="gray.400" /></InputLeftElement>
              <Input
                placeholder="Protocolo ou endereço..."
                size="sm"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>

            <Menu>
              <MenuButton as={Box} position="relative" cursor="pointer">
                <IconButton aria-label="Notificações" icon={<BellIcon />} variant="ghost" />
                {alertasVencidos.length > 0 && (
                  <Badge position="absolute" top="0" right="0" colorScheme="red" borderRadius="full">
                    {alertasVencidos.length}
                  </Badge>
                )}
              </MenuButton>
              <MenuList>
                <Text px={3} py={2} fontSize="xs" fontWeight="bold" color="gray.500">ALERTAS CRÍTICOS</Text>
                {alertasVencidos.length === 0 && (
                  <Text px={3} py={2} fontSize="sm" color="gray.400">Nenhum SLA vencido</Text>
                )}
                {alertasVencidos.slice(0, 5).map((a) => (
                  <MenuItem key={a.id} onClick={() => { setSelectedAlerta(a); onOpen() }}>
                    ⚠️ {a.protocolo} ({a.slaRestante}h)
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Avatar size="sm" name={usuario?.nome ?? 'Gestor'} bg="blue.500" />
          </HStack>
        </HStack>
      </Box>

      <Container maxW="100%" py={6}>
        <VStack spacing={6} align="stretch">

          {/* KPIs */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {kpis.map((kpi, i) => (
              <Card key={i} bg={kpi.bgColor} border="1px solid" borderColor={`${kpi.color}.100`}>
                <CardBody p={4}>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="xl">{kpi.icon}</Text>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">{kpi.label}</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={`${kpi.color}.700`}>{kpi.value}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Charts */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Card><CardBody>
              <Heading size="sm" mb={4}>📊 Demandas por Categoria</Heading>
              {graficoData.length === 0 ? (
                <Box height="300px" display="flex" alignItems="center" justifyContent="center">
                  <Text color="gray.400" fontSize="sm">Sem dados de categoria</Text>
                </Box>
              ) : (
                <Box height="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graficoData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="categoria" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip formatter={(v) => [`${v} demandas`, 'Total']} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        {graficoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardBody></Card>

            <Card><CardBody>
              <Heading size="sm" mb={4}>🗺️ Mapa de Calor</Heading>
              <Box height="300px" borderRadius="md" overflow="hidden">
                <Heatmap data={heatmapData} />
              </Box>
            </CardBody></Card>
          </SimpleGrid>

          {/* Fila de atendimento */}
          <Card borderTop="4px solid" borderTopColor="red.500">
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <HStack spacing={4}>
                  <Heading size="sm">🚨 Fila de Atendimento</Heading>
                  <Select
                    size="xs"
                    width="150px"
                    value={slaFilter}
                    onChange={(e) => setSlaFilter(e.target.value as typeof slaFilter)}
                    borderRadius="md"
                  >
                    <option value="todos">Todos os SLAs</option>
                    <option value="vencidos">Apenas Vencidos</option>
                    <option value="no_prazo">No Prazo</option>
                  </Select>
                </HStack>
                <Badge colorScheme="red">{alertasProcessados.length} chamados</Badge>
              </HStack>

              <Box overflowX="auto">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>PROTOCOLO</Th>
                      <Th>CATEGORIA</Th>
                      <Th>STATUS</Th>
                      <Th>SLA RESTANTE</Th>
                      <Th>AÇÃO</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {alertasProcessados.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={8} color="gray.400">
                          Nenhum chamado encontrado.
                        </Td>
                      </Tr>
                    ) : (
                      alertasProcessados.map((a) => (
                        <Tr key={a.id} _hover={{ bg: 'gray.50' }}>
                          <Td fontWeight="bold" fontSize="xs" fontFamily="monospace">{a.protocolo}</Td>
                          <Td fontSize="xs">{typeof a.categoria === 'string' ? a.categoria : (a.categoria as any)?.nome ?? ''}</Td>
                          <Td><Badge size="sm" colorScheme="blue" variant="subtle">{a.status}</Badge></Td>
                          <Td fontWeight="bold" color={a.slaRestante < 0 ? 'red.600' : 'orange.600'}>
                            {a.slaRestante < 0
                              ? `❌ Vencido (${a.slaRestante}h)`
                              : `⚠️ ${a.slaRestante}h restantes`}
                          </Td>
                          <Td>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => { setSelectedAlerta(a); onOpen() }}
                            >
                              Ver SLA
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Modal — detalhes SLA */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px">Detalhes do SLA — {selectedAlerta?.protocolo}</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Box
                p={4}
                bg={selectedAlerta?.slaRestante < 0 ? 'red.50' : 'green.50'}
                borderRadius="md"
              >
                <Text fontSize="xs" fontWeight="bold">SITUAÇÃO ATUAL</Text>
                <Heading
                  size="md"
                  color={selectedAlerta?.slaRestante < 0 ? 'red.600' : 'green.600'}
                >
                  {selectedAlerta?.slaRestante < 0
                    ? `Atrasado em ${Math.abs(selectedAlerta.slaRestante)} horas`
                    : `Dentro do prazo (${selectedAlerta?.slaRestante}h)`}
                </Heading>
              </Box>
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">LIMITE SLA</Text>
                  <Text fontWeight="bold">
                    {selectedAlerta?.slaDeadline
                      ? new Date(selectedAlerta.slaDeadline).toLocaleString('pt-BR')
                      : 'Não definido'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">CRIADO EM</Text>
                  <Text fontWeight="bold">
                    {selectedAlerta?.criadoEm
                      ? new Date(selectedAlerta.criadoEm).toLocaleDateString('pt-BR')
                      : '-'}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px">
            <Button variant="ghost" mr={3} onClick={onClose}>Fechar</Button>
            <Button
              as="a"
              href={`/gestor/chamados/${selectedAlerta?.id}`}
              colorScheme="blue"
            >
              Abrir Chamado
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
