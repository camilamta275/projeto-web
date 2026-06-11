'use client'

import React, { useState, useEffect } from 'react'
import {
  Box, Container, VStack, HStack, Heading, Text, Button, Card, CardBody,
  Divider, Spinner, Alert, AlertIcon, AlertDescription, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Select, Textarea, useToast,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import { api } from '@/lib/api'

// ─── types ────────────────────────────────────────────────────────────────────

interface TimelineEventItem {
  id: string
  tipo: string
  titulo: string | null
  descricao: string
  autor: string | null
  timestamp: string
}

interface ChamadoDetalhe {
  id: string
  protocolo: string
  categoria: string
  subcategoria: string
  descricao: string
  status: string
  prioridade: string
  endereco: string
  slaHoras: number
  slaDeadline: string | null
  criadoEm: string
  cidadaoNome: string
  orgao: string
  timeline: TimelineEventItem[]
}

interface MembroEquipe {
  id: string
  nome: string
  email: string
  departamento: string | null
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, string> = {
  criacao: '📝', status: '🔄', mensagem: '💬', transferencia: '↪️', conclusao: '✅',
}

function calcSlaRestante(slaDeadline: string | null, slaHoras: number, criadoEm: string): number {
  const deadline = slaDeadline
    ? new Date(slaDeadline)
    : new Date(new Date(criadoEm).getTime() + slaHoras * 3_600_000)
  return Math.round((deadline.getTime() - Date.now()) / 3_600_000)
}

function fmt(ts: string): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ORGAOS = [
  { id: 'EMLURB',  nome: 'EMLURB — Manutenção e Limpeza Urbana' },
  { id: 'COMPESA', nome: 'COMPESA — Saneamento' },
  { id: 'CELPE',   nome: 'CELPE — Energia' },
  { id: 'CTTU',    nome: 'CTTU — Trânsito' },
  { id: 'SINFRA',  nome: 'SINFRA — Infraestrutura Estadual' },
  { id: 'SEMC',    nome: 'SEMC — Manutenção da Cidade' },
]

const DONE = ['Resolvido', 'Fechado']

// ─── page ─────────────────────────────────────────────────────────────────────

export default function GestorChamadoPage() {
  const params  = useParams()
  const id      = params?.id as string
  const toast   = useToast()

  // modals
  const encaminharModal  = useDisclosure()
  const equipeModal      = useDisclosure()
  const pausarModal      = useDisclosure()
  const concluirModal    = useDisclosure()

  // data
  const [chamado, setChamado]         = useState<ChamadoDetalhe | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  // modal state — Encaminhar
  const [orgaoDestino, setOrgaoDestino]   = useState('')
  const [justEncaminhar, setJustEncaminhar] = useState('')

  // modal state — Designar Equipe
  const [equipe, setEquipe]               = useState<MembroEquipe[]>([])
  const [gestorSelecionado, setGestorSelecionado] = useState('')

  // modal state — Pausar SLA
  const [justPausar, setJustPausar]       = useState('')

  // modal state — Concluir
  const [notaConclusao, setNotaConclusao] = useState('')

  // ── fetch ─────────────────────────────────────────────────────────────────

  const fetchChamado = async () => {
    if (!id) return
    try {
      const { data } = await api.get(`/gestor/chamados/${id}`)
      setChamado(data.chamado)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar chamado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchChamado() }, [id])

  // ── actions ───────────────────────────────────────────────────────────────

  const run = async (key: string, fn: () => Promise<void>) => {
    setLoadingAction(key)
    try {
      await fn()
    } catch (err) {
      toast({ title: 'Erro', description: err instanceof Error ? err.message : 'Erro inesperado', status: 'error', duration: 4000 })
    } finally {
      setLoadingAction(null)
    }
  }

  const handleAceitar = () => run('aceitar', async () => {
    await api.put(`/gestor/chamados/${id}/aceitar`)
    toast({ title: 'Chamado aceito!', description: 'Você agora é o responsável.', status: 'success', duration: 3000 })
    await fetchChamado()
  })

  const handleEncaminhar = () => {
    if (!orgaoDestino || !justEncaminhar.trim()) {
      toast({ title: 'Preencha todos os campos', status: 'warning' })
      return
    }
    run('encaminhar', async () => {
      await api.put(`/gestor/chamados/${id}/transferir`, { orgaoId: orgaoDestino, justificativa: justEncaminhar })
      toast({ title: 'Chamado transferido!', status: 'success', duration: 3000 })
      encaminharModal.onClose()
      setOrgaoDestino('')
      setJustEncaminhar('')
      await fetchChamado()
    })
  }

  const handleOpenEquipe = async () => {
    try {
      const { data } = await api.get('/gestor/equipe')
      setEquipe(data.equipe)
      equipeModal.onOpen()
    } catch {
      toast({ title: 'Erro ao carregar equipe', status: 'error' })
    }
  }

  const handleDesignarEquipe = () => {
    if (!gestorSelecionado) {
      toast({ title: 'Selecione um gestor', status: 'warning' })
      return
    }
    run('equipe', async () => {
      await api.put(`/gestor/chamados/${id}/aceitar`, { gestorDestinoId: gestorSelecionado })
      const nome = equipe.find(g => g.id === gestorSelecionado)?.nome ?? gestorSelecionado
      toast({ title: 'Chamado atribuído!', description: `Atribuído a ${nome}.`, status: 'success', duration: 3000 })
      equipeModal.onClose()
      setGestorSelecionado('')
      await fetchChamado()
    })
  }

  const handlePausarSLA = () => {
    if (!justPausar.trim()) {
      toast({ title: 'Informe o motivo da pausa', status: 'warning' })
      return
    }
    run('pausar', async () => {
      await api.put(`/gestor/chamados/${id}/status`, { status: 'Aguardando', justificativa: justPausar })
      toast({ title: 'SLA pausado', description: 'Status alterado para Aguardando.', status: 'info', duration: 3000 })
      pausarModal.onClose()
      setJustPausar('')
      await fetchChamado()
    })
  }

  const handleConcluir = () => run('concluir', async () => {
    await api.put(`/gestor/chamados/${id}/status`, {
      status: 'Resolvido',
      resolutionNote: notaConclusao.trim() || 'Chamado concluído pelo gestor.',
    })
    toast({ title: 'Chamado concluído!', description: 'O cidadão receberá uma notificação.', status: 'success', duration: 3000 })
    concluirModal.onClose()
    setNotaConclusao('')
    await fetchChamado()
  })

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="lg" color="blue.500" />
      </Box>
    )
  }

  if (error || !chamado) {
    return (
      <Container maxW="100%" py={6} px={4}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>{error ?? 'Chamado não encontrado.'}</AlertDescription>
        </Alert>
        <Link href="/gestor/fila">
          <Button mt={4} leftIcon={<ArrowBackIcon />} variant="ghost">Voltar à fila</Button>
        </Link>
      </Container>
    )
  }

  const slaRestante = calcSlaRestante(chamado.slaDeadline, chamado.slaHoras, chamado.criadoEm)
  const isDone = DONE.includes(chamado.status)

  return (
    <Box>
      {/* Header */}
      <Box bg="white" borderBottomWidth="1px" py={4} px={4}>
        <Container maxW="100%">
          <HStack spacing={4}>
            <Link href="/gestor/fila">
              <Button variant="ghost" size="sm" leftIcon={<ArrowBackIcon />}>Voltar</Button>
            </Link>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500">Protocolo</Text>
              <Text fontSize="lg" fontWeight="bold" fontFamily="monospace">{chamado.protocolo}</Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">

          {/* Info */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">{chamado.categoria}</Heading>
                    <Text color="gray.600">{chamado.subcategoria}</Text>
                  </VStack>
                  <HStack spacing={2}>
                    <StatusBadge status={chamado.status as any} />
                    <PriorityBadge priority={chamado.prioridade as any} />
                  </HStack>
                </HStack>

                <Divider />

                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">Descrição</Text>
                  <Text color="gray.700">{chamado.descricao}</Text>
                </VStack>

                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {[
                    ['Localização',        chamado.endereco],
                    ['Órgão Responsável',  chamado.orgao],
                    ['SLA Horas',          `${chamado.slaHoras}h`],
                    ['Cidadão',            chamado.cidadaoNome],
                  ].map(([label, value]) => (
                    <VStack key={label} align="start" spacing={1} bg="gray.50" p={3} borderRadius="md">
                      <Text fontSize="xs" color="gray.600">{label}</Text>
                      <Text fontSize="sm" fontWeight="bold">{value}</Text>
                    </VStack>
                  ))}
                </SimpleGrid>

                <Card bg={slaRestante < 0 ? 'red.50' : 'green.50'}>
                  <CardBody py={3}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{slaRestante < 0 ? '🔴 Vencido' : '🟢 No Prazo'}</Text>
                      <Text fontWeight="bold">
                        {slaRestante < 0 ? `Vencido há ${Math.abs(slaRestante)}h` : `${slaRestante}h restantes`}
                      </Text>
                    </HStack>
                    <Box mt={2} w="100%" h="8px" bg={slaRestante < 0 ? 'red.500' : 'green.500'} borderRadius="full" />
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4} w="100%">
                <Heading size="md">📅 Timeline</Heading>
                {chamado.timeline.length === 0 ? (
                  <Text color="gray.400" fontSize="sm">Nenhum evento registrado.</Text>
                ) : (
                  <Box w="100%" borderLeftWidth="3px" borderLeftColor="blue.400" pl={4}>
                    {chamado.timeline.map((ev) => (
                      <VStack key={ev.id} align="start" spacing={1} pb={4}>
                        <HStack spacing={2}>
                          <Text fontSize="xl">{ICON_MAP[ev.tipo] ?? '📌'}</Text>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold">{ev.titulo ?? ev.tipo}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {fmt(ev.timestamp)}{ev.autor && ` • ${ev.autor}`}
                            </Text>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color="gray.700">{ev.descricao}</Text>
                      </VStack>
                    ))}
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Ações */}
          <Card bg="blue.50" borderTopWidth="4px" borderTopColor="blue.500">
            <CardBody>
              <VStack align="start" spacing={3}>
                <Heading size="sm">⚙️ Ações do Gestor</Heading>
                <HStack spacing={2} flexWrap="wrap">
                  <Button
                    colorScheme="green"
                    isLoading={loadingAction === 'aceitar'}
                    isDisabled={isDone || !!loadingAction}
                    onClick={handleAceitar}
                  >✓ Aceitar</Button>

                  <Button
                    colorScheme="orange"
                    isDisabled={isDone || !!loadingAction}
                    onClick={encaminharModal.onOpen}
                  >↪️ Encaminhar</Button>

                  <Button
                    colorScheme="purple"
                    isLoading={loadingAction === 'equipe'}
                    isDisabled={isDone || !!loadingAction}
                    onClick={handleOpenEquipe}
                  >👥 Designar Equipe</Button>

                  <Button
                    colorScheme="yellow"
                    isLoading={loadingAction === 'pausar'}
                    isDisabled={isDone || chamado.status === 'Aguardando' || !!loadingAction}
                    onClick={pausarModal.onOpen}
                  >⏸ Pausar SLA</Button>

                  <Button
                    colorScheme="blue"
                    isLoading={loadingAction === 'concluir'}
                    isDisabled={isDone || !!loadingAction}
                    onClick={concluirModal.onOpen}
                  >✅ Concluir</Button>
                </HStack>
                {isDone && (
                  <Text fontSize="xs" color="gray.500">Chamado encerrado — nenhuma ação disponível.</Text>
                )}
              </VStack>
            </CardBody>
          </Card>

        </VStack>
      </Container>

      {/* Modal — Encaminhar */}
      <Modal isOpen={encaminharModal.isOpen} onClose={encaminharModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>↪️ Encaminhar Chamado</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="sm">Órgão Destino</Text>
                <Select value={orgaoDestino} onChange={(e) => setOrgaoDestino(e.target.value)} placeholder="Selecione...">
                  {ORGAOS.filter(o => o.id !== chamado.orgao).map((o) => (
                    <option key={o.id} value={o.id}>{o.nome}</option>
                  ))}
                </Select>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="sm">Justificativa</Text>
                <Textarea
                  value={justEncaminhar}
                  onChange={(e) => setJustEncaminhar(e.target.value)}
                  placeholder="Explique o motivo do encaminhamento..."
                  minH="100px"
                />
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={encaminharModal.onClose}>Cancelar</Button>
              <Button colorScheme="orange" isLoading={loadingAction === 'encaminhar'} onClick={handleEncaminhar}>
                Encaminhar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal — Designar Equipe */}
      <Modal isOpen={equipeModal.isOpen} onClose={equipeModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>👥 Designar Responsável</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Selecione um gestor do seu órgão para assumir este chamado.
              </Text>
              <Select value={gestorSelecionado} onChange={(e) => setGestorSelecionado(e.target.value)} placeholder="Selecione um gestor...">
                {equipe.map((g) => (
                  <option key={g.id} value={g.id}>{g.nome} — {g.departamento ?? g.email}</option>
                ))}
              </Select>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={equipeModal.onClose}>Cancelar</Button>
              <Button colorScheme="purple" isLoading={loadingAction === 'equipe'} onClick={handleDesignarEquipe}>
                Atribuir
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal — Pausar SLA */}
      <Modal isOpen={pausarModal.isOpen} onClose={pausarModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⏸ Pausar SLA</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color="gray.600">
                O chamado passará para <strong>Aguardando</strong>. Descreva o motivo.
              </Text>
              <Textarea
                value={justPausar}
                onChange={(e) => setJustPausar(e.target.value)}
                placeholder="Ex: Aguardando retorno do cidadão, fornecedor em campo..."
                minH="100px"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={pausarModal.onClose}>Cancelar</Button>
              <Button colorScheme="yellow" isLoading={loadingAction === 'pausar'} onClick={handlePausarSLA}>
                Pausar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal — Concluir */}
      <Modal isOpen={concluirModal.isOpen} onClose={concluirModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>✅ Concluir Chamado</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align="stretch">
              <Text fontSize="sm" color="gray.600">
                O chamado será marcado como <strong>Resolvido</strong>. Descreva a resolução (opcional).
              </Text>
              <Textarea
                value={notaConclusao}
                onChange={(e) => setNotaConclusao(e.target.value)}
                placeholder="Ex: Buraco tapado, serviço concluído em 24h..."
                minH="100px"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={concluirModal.onClose}>Cancelar</Button>
              <Button colorScheme="blue" isLoading={loadingAction === 'concluir'} onClick={handleConcluir}>
                Confirmar Conclusão
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
