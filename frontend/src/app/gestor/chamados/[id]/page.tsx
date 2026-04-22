'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,

  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Textarea,
  useToast,
  Image,
  SimpleGrid,
} from '@chakra-ui/react'
import Link from 'next/link'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { StatusBadge } from '@/components/StatusBadge'
import { PriorityBadge } from '@/components/PriorityBadge'
import type { TimelineEvent } from '@/types'

interface Chamado {
  id: string
  protocolo: string
  categoria: string
  subcategoria: string
  descricao: string
  status: string
  prioridade: string
  endereco: string
  foto?: string
  slaHoras: number
  slaRestante: number
  usuarioId: string
  usuarioNome: string
  orgaoId: number
  orgao: string
  timeline: TimelineEvent[]
}

const chamado: Chamado = {
  id: '1',
  protocolo: 'SCH-2026-0142',
  categoria: 'Água e Esgoto',
  subcategoria: 'Falta de Água',
  descricao:
    'Falta de água há 3 dias em toda a Rua Guararapes. Situação crítica. Vizinhos precisam de água potável.',
  status: 'Em Análise',
  prioridade: 'Alta',
  endereco: 'Av. Guararapes, 100 - Centro, Recife - PE',
  foto: 'https://images.unsplash.com/photo-1578991671971-6ad83d43159b?w=400',
  slaHoras: 48,
  slaRestante: -3,
  usuarioId: '1',
  usuarioNome: 'Maria Santos',
  orgaoId: 3,
  orgao: 'COMPESA',
  timeline: [
    {
      id: '1',
      tipo: 'criacao',
      titulo: 'Chamado Registrado',
      descricao: 'Cidadão registrou novo chamado',
      usuario: 'Maria Santos',
      timestamp: '2026-04-19 10:30',
    },
    {
      id: '2',
      tipo: 'status',
      titulo: 'Status Atualizado',
      descricao: 'Mudança de status para Em Análise',
      usuario: 'Pedro Silva',
      timestamp: '2026-04-19 11:15',
    },
    {
      id: '3',
      tipo: 'mensagem',
      titulo: 'Mensagem Adicionada',
      descricao: 'Equipe enviou atualização: Verificação técnica em andamento',
      usuario: 'Pedro Silva',
      timestamp: '2026-04-19 14:00',
    },
  ],
}

const tiposOrgao = [
  { id: 1, nome: 'PMR - Prefeitura do Recife' },
  { id: 2, nome: 'GOPE - Governo do Estado PE' },
  { id: 3, nome: 'COMPESA - Água' },
  { id: 4, nome: 'Energisa - Energia' },
  { id: 5, nome: 'DETRAN-PE - Trânsito' },
]

export default function GestorChamadoPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [orgaoDestino, setOrgaoDestino] = React.useState('')
  const [justificativa, setJustificativa] = React.useState('')

  const handleAceitar = () => {
    toast({
      title: 'Chamado Aceito',
      description: 'Você agora é o responsável por este chamado',
      status: 'success',
    })
  }

  const handleEncaminhar = () => {
    if (!orgaoDestino || !justificativa) {
      toast({
        title: 'Preencha todos os campos',
        status: 'warning',
      })
      return
    }
    toast({
      title: 'Chamado Encaminhado',
      description: `Encaminhado para ${tiposOrgao.find((o) => o.id === parseInt(orgaoDestino))?.nome}`,
      status: 'success',
    })
    setOrgaoDestino('')
    setJustificativa('')
    onClose()
  }

  const handleDesignarEquipe = () => {
    toast({
      title: 'Equipe Designada',
      description: 'Equipe técnica foi notificada',
      status: 'success',
    })
  }

  const handlePausarSLA = () => {
    toast({
      title: 'SLA Pausado',
      status: 'info',
    })
  }

  const handleConcluir = () => {
    toast({
      title: 'Chamado Concluído',
      description: 'O cidadão receberá uma notificação',
      status: 'success',
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box bg="white" borderBottomWidth="1px" py={4} px={4}>
        <Container maxW="100%">
          <HStack spacing={4} align="center">
            <Link href="/gestor/fila">
              <Button variant="ghost" size="sm" leftIcon={<ArrowBackIcon />}>
                Voltar
              </Button>
            </Link>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color="gray.500">
                Protocolo
              </Text>
              <Text fontSize="lg" fontWeight="bold" fontFamily="monospace">
                {chamado.protocolo}
              </Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">
          {/* Info Principal */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2}>
                    <Heading size="lg">{chamado.categoria}</Heading>
                    <Text color="gray.600">{chamado.subcategoria}</Text>
                  </VStack>
                  <HStack spacing={2}>
                    <StatusBadge status={chamado.status as any} />
                    <PriorityBadge priority={chamado.prioridade as any} />
                  </HStack>
                </HStack>

                <Divider />

                {/* Foto */}
                {chamado.foto && (
                  <Image
                    src={chamado.foto}
                    alt="Foto do chamado"
                    maxH="400px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                )}

                {/* Descrição */}
                <VStack align="start" spacing={2} width="100%">
                  <Text fontWeight="bold">Descrição</Text>
                  <Text color="gray.700">{chamado.descricao}</Text>
                </VStack>

                {/* Info Grid */}
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} width="100%">
                  <VStack align="start" spacing={1} bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      Localização
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {chamado.endereco}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1} bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      Órgão Responsável
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {chamado.orgao}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1} bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      SLA Horas
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {chamado.slaHoras}h
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1} bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.600">
                      Cidadão
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {chamado.usuarioNome}
                    </Text>
                  </VStack>
                </SimpleGrid>

                {/* SLA Progress */}
                <Card bg={chamado.slaRestante < 0 ? 'red.50' : 'green.50'}>
                  <CardBody>
                    <VStack align="start" spacing={2} width="100%">
                      <HStack width="100%" justify="space-between">
                        <Text fontWeight="bold">
                          {chamado.slaRestante < 0 ? '🔴 Vencido' : '🟢 No Prazo'}
                        </Text>
                        <Text fontWeight="bold">
                          {chamado.slaRestante < 0
                            ? `Vencido há ${Math.abs(chamado.slaRestante)}h`
                            : `${chamado.slaRestante}h restantes`}
                        </Text>
                      </HStack>
                      <Box
                        width="100%"
                        height="8px"
                        bg={chamado.slaRestante < 0 ? 'red.500' : 'green.500'}
                        borderRadius="full"
                      />
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>

          {/* Timeline */}
          <Card>
            <CardBody>
              <VStack align="start" spacing={4} width="100%">
                <Heading size="md">📅 Timeline</Heading>

                <Box width="100%" borderLeftWidth="3px" borderLeftColor="primary.500" pl={4}>
                  {chamado.timeline.map((event) => {
                    const iconMap: Record<string, string> = {
                      criacao: '📝',
                      status: '🔄',
                      mensagem: '💬',
                      transferencia: '↪️',
                      conclusao: '✅',
                    }

                    return (
                      <VStack key={event.id} align="start" spacing={1} pb={4}>
                        <HStack spacing={2} width="100%">
                          <Text fontSize="xl">{iconMap[event.tipo]}</Text>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="bold">
                              {event.titulo || event.tipo}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {event.timestamp}
                              {event.usuario && ` • ${event.usuario}`}
                            </Text>
                          </VStack>
                        </HStack>
                        <Text fontSize="sm" color="gray.700">
                          {event.descricao}
                        </Text>
                      </VStack>
                    )
                  })}
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Botões de Ação */}
          <Card bg="blue.50" borderTopWidth="4px" borderTopColor="blue.500">
            <CardBody>
              <VStack align="start" spacing={3} width="100%">
                <Heading size="sm">⚙️ Ações do Gestor</Heading>
                <HStack spacing={2} flexWrap="wrap" width="100%">
                  <Button colorScheme="green" onClick={handleAceitar}>
                    ✓ Aceitar
                  </Button>
                  <Button colorScheme="orange" onClick={onOpen}>
                    ↪️ Encaminhar
                  </Button>
                  <Button colorScheme="purple" onClick={handleDesignarEquipe}>
                    👥 Designar Equipe
                  </Button>
                  <Button colorScheme="yellow" onClick={handlePausarSLA}>
                    ⏸ Pausar SLA
                  </Button>
                  <Button colorScheme="blue" onClick={handleConcluir}>
                    ✅ Concluir
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Modal Encaminhar */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>↪️ Encaminhar Chamado</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Órgão Destino</Text>
                <Select
                  value={orgaoDestino}
                  onChange={(e) => setOrgaoDestino(e.target.value)}
                  placeholder="Selecione um órgão..."
                >
                  {tiposOrgao.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.nome}
                    </option>
                  ))}
                </Select>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Justificativa</Text>
                <Textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Explique o motivo do encaminhamento..."
                  minH="120px"
                />
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="orange" onClick={handleEncaminhar}>
                Encaminhar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
