'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Checkbox,
  Card,
  CardBody,
  Input,
  useToast,
} from '@chakra-ui/react'
import Link from 'next/link'
// import { useGestorStore } from '@/stores/gestorStore'
// import { useAuthStore } from '@/stores/authStore'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'

interface Chamado {
  id: string
  protocolo: string
  categoria: string
  endereco: string
  slaRestante: number
  prioridade: string
  status: string
  foto?: string
}

const chamados: Chamado[] = [
  {
    id: '1',
    protocolo: 'SCH-2026-0142',
    categoria: 'Água e Esgoto',
    endereco: 'Av. Guararapes, 100 - Centro',
    slaRestante: -3,
    prioridade: 'Alta',
    status: 'Em Análise',
  },
  {
    id: '2',
    protocolo: 'SCH-2026-0135',
    categoria: 'Energia e Iluminação',
    endereco: 'Rua Gervásio Pires, 450 - Boa Vista',
    slaRestante: -8,
    prioridade: 'Crítica',
    status: 'Aberto',
  },
  {
    id: '3',
    protocolo: 'SCH-2026-0128',
    categoria: 'Problemas na Via',
    endereco: 'Rua Nunes Machado, 200 - Santo Amaro',
    slaRestante: 6,
    prioridade: 'Média',
    status: 'Em Andamento',
  },
  {
    id: '4',
    protocolo: 'SCH-2026-0121',
    categoria: 'Saneamento Básico',
    endereco: 'Rua da Aurora, 300 - Recife Antigo',
    slaRestante: -12,
    prioridade: 'Alta',
    status: 'Aguardando',
  },
  {
    id: '5',
    protocolo: 'SCH-2026-0115',
    categoria: 'Trânsito e Segurança',
    endereco: 'Av. Rio Branco, 150 - Várzea',
    slaRestante: 2,
    prioridade: 'Média',
    status: 'Em Análise',
  },
  {
    id: '6',
    protocolo: 'SCH-2026-0108',
    categoria: 'Água e Esgoto',
    endereco: 'Rua Marquês de Olinda, 50 - Recife Antigo',
    slaRestante: -5,
    prioridade: 'Alta',
    status: 'Em Andamento',
  },
]

export default function FilaPage() {
  const toast = useToast()
  // const { usuario } = useAuthStore()
  const [selected, setSelected] = React.useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = React.useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = React.useState('todas')
  const [filtroPeriodo, setFiltroPeriodo] = React.useState('todos')
  const [busca, setBusca] = React.useState('')

  const handleSelectAll = () => {
    if (selected.length === chamados.length) {
      setSelected([])
    } else {
      setSelected(chamados.map((c) => c.id))
    }
  }

  const handleSelectOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleAcaoEmLote = (acao: string) => {
    toast({
      title: `${acao} em ${selected.length} chamado(s)`,
      status: 'info',
      duration: 2,
    })
    setSelected([])
  }

  const chamadosFiltrados = chamados.filter((c) => {
    const matchBusca = c.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
      c.endereco.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    const matchPrioridade = filtroPrioridade === 'todas' || c.prioridade === filtroPrioridade

    return matchBusca && matchStatus && matchPrioridade
  })

  return (
    <Box>
      {/* Header */}
      <Box bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)" color="white" py={6} px={4}>
        <Container maxW="100%">
          <VStack align="start" spacing={2}>
            <Heading size="lg">📋 Fila de Chamados</Heading>
            <Text opacity={0.8}>{chamadosFiltrados.length} chamados disponíveis</Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">
          {/* Filtros */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm">🔍 Filtros</Heading>
                <HStack spacing={3} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                  <Input
                    placeholder="Buscar por protocolo ou endereço..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    size="sm"
                    maxW={{ base: '100%', md: '300px' }}
                  />

                  <Select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    size="sm"
                    maxW="150px"
                  >
                    <option value="todos">Todos os status</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando">Aguardando</option>
                  </Select>

                  <Select
                    value={filtroPrioridade}
                    onChange={(e) => setFiltroPrioridade(e.target.value)}
                    size="sm"
                    maxW="150px"
                  >
                    <option value="todas">Todas prioridades</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </Select>

                  <Select
                    value={filtroPeriodo}
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                    size="sm"
                    maxW="150px"
                  >
                    <option value="todos">Todo período</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mês</option>
                  </Select>

                  <Box flex={1} />

                  {selected.length > 0 && (
                    <Badge colorScheme="blue" fontSize="md" px={3} py={2}>
                      {selected.length} selecionado(s)
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Ações em Lote */}
          {selected.length > 0 && (
            <Card bg="blue.50" borderLeftWidth="4px" borderLeftColor="blue.500">
              <CardBody>
                <HStack spacing={2}>
                  <Text fontSize="sm" fontWeight="bold">Ações:</Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleAcaoEmLote('Assumir')}
                  >
                    Assumir
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="orange"
                    variant="outline"
                    onClick={() => handleAcaoEmLote('Encaminhar')}
                  >
                    Encaminhar
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    onClick={() => handleAcaoEmLote('Pausar SLA')}
                  >
                    Pausar SLA
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Tabela */}
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.100">
                <Tr>
                  <Th width="40px">
                    <Checkbox
                      isChecked={selected.length === chamadosFiltrados.length && chamadosFiltrados.length > 0}
                      onChange={handleSelectAll}
                    />
                  </Th>
                  <Th>Protocolo</Th>
                  <Th>Categoria</Th>
                  <Th>Localização</Th>
                  <Th>Prioridade</Th>
                  <Th>Status</Th>
                  <Th>SLA</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {chamadosFiltrados.map((chamado) => (
                  <Tr
                    key={chamado.id}
                    bg={selected.includes(chamado.id) ? 'blue.50' : 'white'}
                    _hover={{ bg: selected.includes(chamado.id) ? 'blue.100' : 'gray.50' }}
                  >
                    <Td>
                      <Checkbox
                        isChecked={selected.includes(chamado.id)}
                        onChange={() => handleSelectOne(chamado.id)}
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
                        <Button size="xs" colorScheme="primary">
                          Assumir
                        </Button>
                        <Link href={`/gestor/chamados/${chamado.id}`}>
                          <Button size="xs" variant="outline">
                            Ver
                          </Button>
                        </Link>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Total */}
          <Text fontSize="xs" color="gray.600" textAlign="right">
            Total: {chamadosFiltrados.length} chamados
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
