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
import { useTicketStore } from '@/stores/ticketStore'

const Heatmap = dynamic(() => import('@/components/Heatmap'), { 
  ssr: false,
  loading: () => (
    <Box height="300px" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
      <Spinner color="blue.500" />
      <Text ml={3}>Carregando Mapa...</Text>
    </Box>
  )
})

const graficoData = [
  { categoria: 'Via', sla: 85, color: '#22c55e' },
  { categoria: 'Água', sla: 72, color: '#eab308' },
  { categoria: 'Energia', sla: 58, color: '#ef4444' },
  { categoria: 'Saneamento', sla: 92, color: '#22c55e' },
  { categoria: 'Trânsito', sla: 68, color: '#eab308' },
]

export default function GestorDashboardPage() {
  const { usuario } = useAuthStore()
  const { metricas, loading: gestorLoading, fetchMetricas } = useGestorStore()
  const { filteredTickets, fetchTickets, isLoading: ticketsLoading, setFilters, filters } = useTicketStore()

  // --- ESTADO LOCAL PARA FILTRO DE SLA ---
  const [slaFilter, setSlaFilter] = useState<'todos' | 'vencidos' | 'no_prazo'>('todos')
  const [selectedProtocolo, setSelectedProtocolo] = useState<any | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    //fetchTickets()
    if (usuario?.orgaoId) fetchMetricas(usuario.orgaoId)
  }, [usuario?.orgaoId, fetchMetricas, fetchTickets])

  // ✅ CÁLCULO DE SLA REAL E FILTRAGEM EXTRA
  const alertasProcessados = useMemo(() => {
    const agora = new Date().getTime()
    
    // Primeiro, calcula o SLA para todos os tickets filtrados pela store (busca/status)
    const comSla = filteredTickets.map(t => {
      const deadline = t.slaDeadline ? new Date(t.slaDeadline).getTime() : agora
      const diffHoras = Math.floor((deadline - agora) / 3600000)
      return { ...t, slaRestante: diffHoras }
    })

    // Segundo, aplica o filtro de SLA local (Vencidos vs No Prazo)
    if (slaFilter === 'vencidos') return comSla.filter(a => a.slaRestante < 0)
    if (slaFilter === 'no_prazo') return comSla.filter(a => a.slaRestante >= 0)
    
    return comSla
  }, [filteredTickets, slaFilter])

  const alertasVencidosParaNotificacao = useMemo(() => 
    alertasProcessados.filter(a => a.slaRestante < 0), [alertasProcessados]
  )

  const heatmapData: [number, number, number][] = useMemo(() => {
    return alertasProcessados
      .filter(t => t.latitude && t.longitude)
      .map(t => [t.latitude, t.longitude, 1.0])
  }, [alertasProcessados])

  const handleActionVerSLA = (alerta: any) => {
    setSelectedProtocolo(alerta)
    onOpen()
  }

  const kpis = [
    { label: 'Total Filtrado', value: alertasProcessados.length, icon: '📋', color: 'blue', bgColor: 'blue.50' },
    { label: 'Em Aberto', value: metricas?.chamadosAbertos || 0, icon: '📭', color: 'orange', bgColor: 'orange.50' },
    { label: 'SLA Encerrado', value: alertasVencidosParaNotificacao.length, icon: '⚠️', color: 'red', bgColor: 'red.50' },
    { label: 'Concluídos', value: 132, change: 8, icon: '✅', color: 'green', bgColor: 'green.50' },
  ]

  if (gestorLoading || ticketsLoading) return <Box display="flex" justifyContent="center" py={20}><Spinner size="xl" /></Box>

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
                placeholder="Buscar protocolo..." 
                size="sm" 
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                borderRadius="md"
              />
            </InputGroup>
            
            <Menu>
              <MenuButton as={Box} position="relative" cursor="pointer">
                <IconButton aria-label="Notificações" icon={<BellIcon />} variant="ghost" />
                {alertasVencidosParaNotificacao.length > 0 && (
                  <Badge position="absolute" top="0" right="0" colorScheme="red" borderRadius="full">
                    {alertasVencidosParaNotificacao.length}
                  </Badge>
                )}
              </MenuButton>
              <MenuList>
                <Text px={3} py={2} fontSize="xs" fontWeight="bold" color="gray.500">ALERTAS CRÍTICOS</Text>
                {alertasVencidosParaNotificacao.slice(0, 5).map(a => (
                  <MenuItem key={a.id} onClick={() => handleActionVerSLA(a)}>
                    ⚠️ {a.protocolo} ({a.slaRestante}h)
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Avatar size="sm" name={usuario?.nome || "Gestor"} bg="blue.500" />
          </HStack>
        </HStack>
      </Box>

      <Container maxW="100%" py={6}>
        <VStack spacing={6} align="stretch">
          
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {kpis.map((kpi, idx) => (
              <Card key={idx} bg={kpi.bgColor} border="1px solid" borderColor={`${kpi.color}.100`}>
                <CardBody p={4}>
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="xl">{kpi.icon}</Text>
                      {kpi.change && <Badge colorScheme={kpi.change > 0 ? 'green' : 'red'}>{kpi.change}%</Badge>}
                    </HStack>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">{kpi.label}</Text>
                      <Text fontSize="2xl" fontWeight="bold" color={`${kpi.color}.700`}>{kpi.value}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <Card><CardBody>
              <Heading size="sm" mb={4}>📊 SLA por Categoria</Heading>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graficoData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="categoria" fontSize={12} />
                    <YAxis domain={[0, 100]} fontSize={12} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="sla" radius={[4, 4, 0, 0]}>
                      {graficoData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody></Card>

            <Card><CardBody>
              <Heading size="sm" mb={4}>🗺️ Mapa de Calor (Filtros Ativos)</Heading>
              <Box height="300px" borderRadius="md" overflow="hidden">
                <Heatmap data={heatmapData} />
              </Box>
            </CardBody></Card>
          </SimpleGrid>

          <Card borderTop="4px solid" borderTopColor="red.500">
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <HStack spacing={4}>
                  <Heading size="sm">🚨 Fila de Atendimento</Heading>
                  <Select 
                    size="xs" 
                    width="150px" 
                    value={slaFilter} 
                    onChange={(e) => setSlaFilter(e.target.value as any)}
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
                    {alertasProcessados.map((a) => (
                      <Tr key={a.id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="bold" fontSize="xs" fontFamily="monospace">{a.protocolo}</Td>
                        <Td fontSize="xs">{a.categoria}</Td>
                        <Td><Badge size="sm" colorScheme="blue" variant="subtle">{a.status}</Badge></Td>
                        <Td fontWeight="bold" color={a.slaRestante < 0 ? "red.600" : "orange.600"}>
                          {a.slaRestante < 0 ? `❌ Vencido (${a.slaRestante}h)` : `⚠️ ${a.slaRestante}h restantes`}
                        </Td>
                        <Td>
                          <Button size="xs" colorScheme="blue" variant="outline" onClick={() => handleActionVerSLA(a)}>
                            Ver SLA
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Modal de Detalhes */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px">Detalhes do SLA - {selectedProtocolo?.protocolo}</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Box p={4} bg={selectedProtocolo?.slaRestante < 0 ? "red.50" : "green.50"} borderRadius="md">
                <Text fontSize="xs" fontWeight="bold">SITUAÇÃO ATUAL</Text>
                <Heading size="md" color={selectedProtocolo?.slaRestante < 0 ? "red.600" : "green.600"}>
                  {selectedProtocolo?.slaRestante < 0 
                    ? `Atrasado em ${Math.abs(selectedProtocolo.slaRestante)} horas` 
                    : `Dentro do prazo (${selectedProtocolo?.slaRestante}h)`}
                </Heading>
              </Box>
              <SimpleGrid columns={2} spacing={4}>
                <Box>
                  <Text fontSize="xs" color="gray.500">LIMITE SLA</Text>
                  <Text fontWeight="bold">{selectedProtocolo?.slaDeadline ? new Date(selectedProtocolo.slaDeadline).toLocaleString() : 'Não definido'}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">CRIADO EM</Text>
                  <Text fontWeight="bold">{selectedProtocolo?.criadoEm ? new Date(selectedProtocolo.criadoEm).toLocaleDateString() : '-'}</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px">
            <Button variant="ghost" mr={3} onClick={onClose}>Fechar</Button>
            <Button colorScheme="blue">Priorizar Chamado</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}