'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Box, Container, VStack, HStack, Heading, Text, Select, Button, Table,
  Thead, Tbody, Tr, Th, Td, Badge, Checkbox, Card, CardBody, Input,
  Spinner, Alert, AlertIcon, AlertDescription,
  useToast
} from '@chakra-ui/react'
import Link from 'next/link'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { useGestorStore } from '@/stores/gestorStore'

interface ChamadoFila {
  id: string
  protocolo: string
  categoria: string
  endereco: string
  slaRestante: number
  prioridade: string
  status: string
  criadoEm: string
}

function calcSlaRestante(slaDeadline: string | undefined, slaHoras: number, criadoEm: string): number {
  const deadline = slaDeadline
    ? new Date(slaDeadline)
    : new Date(new Date(criadoEm).getTime() + slaHoras * 3_600_000)
  return Math.round((deadline.getTime() - Date.now()) / 3_600_000)
}

export default function FilaPage() {
  const toast = useToast()
  const { chamadosFila, loading, error, fetchFilaChamados } = useGestorStore()
  const [selected, setSelected] = useState<string[]>([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetchFilaChamados()
  }, [fetchFilaChamados])

  const chamadosProcessados = useMemo<ChamadoFila[]>(() => {
    const agora = new Date()
    const inicioHoje = new Date(agora.setHours(0, 0, 0, 0))
    const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const umMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return chamadosFila
      .map((c): ChamadoFila => ({
        id: c.id,
        protocolo: c.protocolo,
        categoria: typeof c.categoria === 'string' ? c.categoria : (c.categoria as any)?.nome ?? '',
        endereco: c.endereco,
        slaRestante: calcSlaRestante(c.slaDeadline, c.slaHoras, c.criadoEm),
        prioridade: c.prioridade,
        status: c.status,
        criadoEm: c.criadoEm,
      }))
      .filter((c) => {
        const matchBusca = c.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
                           c.endereco.toLowerCase().includes(busca.toLowerCase())
        const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
        const matchPrioridade = filtroPrioridade === 'todas' || c.prioridade === filtroPrioridade

        const dataCriacao = new Date(c.criadoEm)
        let matchPeriodo = true
        if (filtroPeriodo === 'hoje') matchPeriodo = dataCriacao >= inicioHoje
        if (filtroPeriodo === 'semana') matchPeriodo = dataCriacao >= umaSemanaAtras
        if (filtroPeriodo === 'mes') matchPeriodo = dataCriacao >= umMesAtras

        return matchBusca && matchStatus && matchPrioridade && matchPeriodo
      })
      .sort((a, b) => a.slaRestante - b.slaRestante)
  }, [chamadosFila, busca, filtroStatus, filtroPrioridade, filtroPeriodo])

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
            <Text opacity={0.8}>
              {loading ? 'Carregando...' : `${chamadosProcessados.length} chamados encontrados com os filtros atuais`}
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                {loading ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={10}>
                      <Spinner size="md" color="blue.500" />
                    </Td>
                  </Tr>
                ) : chamadosProcessados.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={10} color="gray.400">
                      Nenhum chamado encontrado com os filtros atuais.
                    </Td>
                  </Tr>
                ) : (
                  chamadosProcessados.map((chamado) => (
                    <Tr
                      key={chamado.id}
                      bg={selected.includes(chamado.id) ? 'blue.50' : 'transparent'}
                      _hover={{ bg: 'gray.50' }}
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
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}