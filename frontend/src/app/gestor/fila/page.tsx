'use client'

import React, { useState, useMemo } from 'react'
import {
  Box, Container, VStack, HStack, Heading, Text, Select, Button, Table,
  Thead, Tbody, Tr, Th, Td, Badge, Checkbox, Card, CardBody, Input,
  useToast, Divider
} from '@chakra-ui/react'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'

// Interface estendida com criadoEm para o filtro de tempo
interface ChamadoFila {
  id: string
  protocolo: string
  categoria: string
  endereco: string
  slaRestante: number
  prioridade: string
  status: string
  criadoEm: string // Formato ISO
}

const MOCK_CHAMADOS: ChamadoFila[] = [
  {
    id: '1',
    protocolo: 'SCH-2026-0142',
    categoria: 'Água e Esgoto',
    endereco: 'Av. Guararapes, 100',
    slaRestante: -3,
    prioridade: 'Alta',
    status: 'Em Análise',
    criadoEm: new Date().toISOString(), // Hoje
  },
  {
    id: '2',
    protocolo: 'SCH-2026-0135',
    categoria: 'Energia e Iluminação',
    endereco: 'Rua Gervásio Pires, 450',
    slaRestante: -8,
    prioridade: 'Crítica',
    status: 'Aberto',
    criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
  },
  {
    id: '3',
    protocolo: 'SCH-2026-0128',
    categoria: 'Problemas na Via',
    endereco: 'Rua Nunes Machado, 200',
    slaRestante: 6,
    prioridade: 'Média',
    status: 'Em Andamento',
    criadoEm: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias atrás
  },
  {
    id: '4',
    protocolo: 'SCH-2026-0121',
    categoria: 'Saneamento Básico',
    endereco: 'Rua da Aurora, 300',
    slaRestante: -12,
    prioridade: 'Alta',
    status: 'Aguardando',
    criadoEm: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // Mês passado
  }
]

export default function FilaPage() {
  const toast = useToast()
  const [selected, setSelected] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')
  const [busca, setBusca] = useState('')

  // ✅ Lógica de Filtragem e Ordenação Combinada
  const chamadosProcessados = useMemo(() => {
    const agora = new Date()
    const inicioHoje = new Date(agora.setHours(0, 0, 0, 0))
    const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return MOCK_CHAMADOS
      .filter((c) => {
        const matchBusca = c.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
                           c.endereco.toLowerCase().includes(busca.toLowerCase())
        const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
        const matchPrioridade = filtroPrioridade === 'todas' || c.prioridade === filtroPrioridade

        // Filtro de Tempo
        const dataCriacao = new Date(c.criadoEm)
        let matchPeriodo = true
        if (filtroPeriodo === 'hoje') matchPeriodo = dataCriacao >= inicioHoje
        if (filtroPeriodo === 'semana') matchPeriodo = dataCriacao >= umaSemanaAtras
        if (filtroPeriodo === 'mes') matchPeriodo = dataCriacao >= umMesAtras

        return matchBusca && matchStatus && matchPrioridade && matchPeriodo
      })
      .sort((a, b) => a.slaRestante - b.slaRestante) // Ordena pelo SLA mais crítico primeiro
  }, [busca, filtroStatus, filtroPrioridade, filtroPeriodo])

  const handleSelectAll = () => {
    if (selected.length === chamadosProcessados.length) {
      setSelected([])
    } else {
      setSelected(chamadosProcessados.map((c) => c.id))
    }
  }

  const handleSelectOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleAcaoEmLote = (acao: string) => {
    toast({
      title: `${acao} realizado!`,
      description: `${selected.length} chamado(s) processado(s).`,
      status: 'success',
      duration: 3000,
    })
    setSelected([])
  }

  return (
    <Box>
      <Box bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)" color="white" py={6} px={4}>
        <Container maxW="100%">
          <VStack align="start" spacing={2}>
            <Heading size="lg">📋 Fila de Atendimento</Heading>
            <Text opacity={0.8}>{chamadosProcessados.length} chamados encontrados com os filtros atuais</Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">
          <Card shadow="sm" border="1px solid" borderColor="gray.200">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="xs" textTransform="uppercase" color="gray.500" letterSpacing="wider">Filtros Avançados</Heading>
                <HStack spacing={3} flexWrap="wrap">
                  <Input
                    placeholder="Protocolo ou endereço..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    size="sm"
                    maxW="300px"
                    bg="white"
                  />

                  <Select size="sm" maxW="160px" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                    <option value="todos">Todos os status</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Em Análise">Em Análise</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando">Aguardando</option>
                  </Select>

                  <Select size="sm" maxW="160px" value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
                    <option value="todas">Prioridades</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </Select>

                  <Select size="sm" maxW="160px" value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                    <option value="todos">Todo período</option>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mês</option>
                  </Select>

                  {selected.length > 0 && (
                    <Badge colorScheme="blue" variant="solid" px={3} py={1} borderRadius="full">
                      {selected.length} selecionados
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {selected.length > 0 && (
            <Card bg="blue.50" border="1px dashed" borderColor="blue.300">
              <CardBody py={3}>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">Ações em Lote Disponíveis:</Text>
                  <HStack spacing={2}>
                    <Button size="xs" colorScheme="blue" onClick={() => handleAcaoEmLote('Assumir')}>Assumir</Button>
                    <Button size="xs" colorScheme="orange" variant="outline" onClick={() => handleAcaoEmLote('Encaminhar')}>Encaminhar</Button>
                    <Button size="xs" colorScheme="purple" variant="outline" onClick={() => handleAcaoEmLote('Pausar SLA')}>Pausar SLA</Button>
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          )}

          <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.200">
            <Table size="sm" variant="simple" bg="white">
              <Thead bg="gray.50">
                <Tr>
                  <Th width="40px">
                    <Checkbox
                      isChecked={selected.length === chamadosProcessados.length && chamadosProcessados.length > 0}
                      onChange={handleSelectAll}
                    />
                  </Th>
                  <Th py={4}>Protocolo</Th>
                  <Th>Categoria</Th>
                  <Th>Localização</Th>
                  <Th>Prioridade</Th>
                  <Th>Status</Th>
                  <Th>SLA</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {chamadosProcessados.map((chamado) => (
                  <Tr 
                    key={chamado.id} 
                    bg={selected.includes(chamado.id) ? 'blue.50' : 'transparent'}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Td>
                      <Checkbox
                        isChecked={selected.includes(chamado.id)}
                        onChange={() => handleSelectOne(chamado.id)}
                      />
                    </Td>
                    <Td fontWeight="bold" color="blue.600" fontFamily="monospace">{chamado.protocolo}</Td>
                    <Td>{chamado.categoria}</Td>
                    <Td maxW="220px" isTruncated fontSize="xs">{chamado.endereco}</Td>
                    <Td><PriorityBadge priority={chamado.prioridade as any} /></Td>
                    <Td><StatusBadge status={chamado.status as any} /></Td>
                    <Td>
                      <HStack spacing={1}>
                        <Box
                          w="8px" h="8px" borderRadius="full"
                          bg={chamado.slaRestante < 0 ? 'red.500' : 'green.500'}
                        />
                        <Text fontWeight="bold" color={chamado.slaRestante < 0 ? 'red.600' : 'green.600'} fontSize="xs">
                          {chamado.slaRestante < 0 ? `Vencido ${Math.abs(chamado.slaRestante)}h` : `${chamado.slaRestante}h restantes`}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="xs" colorScheme="blue">Assumir</Button>
                        <Link href={`/gestor/chamados/${chamado.id}`}>
                          <Button size="xs" variant="ghost">Detalhes</Button>
                        </Link>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}