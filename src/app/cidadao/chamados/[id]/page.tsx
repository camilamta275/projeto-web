'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Divider,
  Spinner,
  Image,
  Card,
  CardBody,
  SimpleGrid,
  Avatar,
  Input,
} from '@chakra-ui/react'
import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useChamadosStore } from '@/stores/chamadosStore'
import { useAuthStore } from '@/stores/authStore'
import { StatusBadge } from '@/components/chamados/StatusBadge'
import { formatDateTime } from '@/utils/dateFormatter'

const prioridadeColors: Record<string, string> = {
  Baixa: 'green',
  Média: 'yellow',
  Alta: 'orange',
  Crítica: 'red',
}

export default function ChamadoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { usuario } = useAuthStore()
  const { chamadoAtual, loading, fetchChamadoPorId } = useChamadosStore()
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (params.id) {
      fetchChamadoPorId(params.id as string)
    }
  }, [params.id, fetchChamadoPorId])

  const copyProtocolo = () => {
    if (chamadoAtual?.protocolo) {
      navigator.clipboard.writeText(chamadoAtual.protocolo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Container maxW="container.lg" py={12} display="flex" justifyContent="center">
        <Spinner size="lg" color="primary.500" />
      </Container>
    )
  }

  if (!chamadoAtual) {
    return (
      <Container maxW="container.lg" py={12}>
        <Text textAlign="center" fontSize="lg" color="gray.500">
          Chamado não encontrado
        </Text>
      </Container>
    )
  }

  // Verificar se é um chamado recém criado (proto sucesso)
  const isChamadoNovo = chamadoAtual.status === 'Aberto' && chamadoAtual.timeline.length <= 1

  return (
    <Box bg={isChamadoNovo ? 'gray.50' : 'white'} minH="100vh">
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Card de Sucesso (se novo) */}
          {isChamadoNovo && (
            <Card
              bg="linear-gradient(135deg, #1a365d 0%, #2d5016 100%)"
              color="white"
              borderRadius="lg"
              boxShadow="2xl"
            >
              <CardBody>
                <VStack spacing={6} align="center" py={6}>
                  <CheckCircleIcon boxSize={14} />
                  <VStack spacing={2} align="center">
                    <Heading size="md">Chamado Registrado com Sucesso! ✨</Heading>
                    <Text fontSize="sm" opacity={0.9}>
                      Seu chamado foi criado e está sendo processado
                    </Text>
                  </VStack>

                  {/* Protocolo Principal */}
                  <Box width="100%" bg="rgba(255,255,255,0.1)" borderRadius="lg" p={5}>
                    <VStack spacing={3}>
                      <Text fontSize="xs" opacity={0.8} fontWeight="bold">
                        SEU PROTOCOLO
                      </Text>
                      <HStack spacing={3} justify="center" width="100%">
                        <Text fontSize="2xl" fontWeight="bold" fontFamily="monospace">
                          {chamadoAtual.protocolo}
                        </Text>
                        <Button
                          size="sm"
                          leftIcon={<CopyIcon />}
                          onClick={copyProtocolo}
                          bg="white"
                          color="primary.700"
                          _hover={{ bg: 'gray.100' }}
                        >
                          {copied ? '✓ Copiado!' : 'Copiar'}
                        </Button>
                      </HStack>
                      <Text fontSize="xs" opacity={0.7}>
                        Guarde este número para consultar seu chamado
                      </Text>
                    </VStack>
                  </Box>

                  <Text fontSize="xs" opacity={0.8}>
                    Você receberá atualizações por email em: <strong>{usuario?.email}</strong>
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Header Principal */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={3}>
              <HStack>
                <Heading size="lg">{chamadoAtual.protocolo}</Heading>
                {!isChamadoNovo && (
                  <Button size="xs" leftIcon={<CopyIcon />} onClick={copyProtocolo}>
                    {copied ? '✓' : 'Copiar'}
                  </Button>
                )}
              </HStack>
              <HStack spacing={2}>
                <StatusBadge status={chamadoAtual.status} />
                <Badge colorScheme={prioridadeColors[chamadoAtual.prioridade]} fontSize="sm">
                  {chamadoAtual.prioridade}
                </Badge>
              </HStack>
            </VStack>
            <Button
              variant="outline"
              onClick={() => {
                if (document.referrer.includes('/chamados')) {
                  router.back()
                } else {
                  router.push('/cidadao/chamados')
                }
              }}
            >
              ← Voltar
            </Button>
          </HStack>

          <Divider />

          {/* Main Info */}
          <HStack spacing={6} align="start">
            {(chamadoAtual.fotoUrl || chamadoAtual.foto) && (
              <Box flex={1}>
                <Image
                  src={chamadoAtual.fotoUrl || chamadoAtual.foto}
                  alt="Foto do chamado"
                  borderRadius="lg"
                  maxH="300px"
                  w="100%"
                  objectFit="cover"
                />
              </Box>
            )}

            <VStack align="start" spacing={4} flex={1}>
              <VStack align="start" spacing={1} width="100%">
                <Heading size="sm">Descrição</Heading>
                <Text color="gray.700">{chamadoAtual.descricao}</Text>
              </VStack>

              <VStack align="start" spacing={1} width="100%">
                <Heading size="sm">Localização</Heading>
                <Text fontSize="sm">{chamadoAtual.endereco}</Text>
                <Text fontSize="xs" color="gray.500">
                  📍 {chamadoAtual.latitude.toFixed(4)}, {chamadoAtual.longitude.toFixed(4)}
                </Text>
              </VStack>
            </VStack>
          </HStack>

          <Divider />

          {/* Info Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box>
              <Text fontSize="xs" color="gray.600" fontWeight="bold">
                CATEGORIA
              </Text>
              <Text fontWeight="bold" mt={1}>
                {chamadoAtual.categoria}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {chamadoAtual.subcategoria}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600" fontWeight="bold">
                SLA
              </Text>
              <Text fontWeight="bold" mt={1}>
                {chamadoAtual.slaHoras}h
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600" fontWeight="bold">
                CRIADO EM
              </Text>
              <Text fontSize="sm" fontWeight="bold" mt={1}>
                {formatDateTime(chamadoAtual.criadoEm)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600" fontWeight="bold">
                ÓRGÃO
              </Text>
              <Text fontSize="sm" fontWeight="bold" mt={1}>
                {chamadoAtual.orgaoId === 1 && '🏛️ PMR'}
                {chamadoAtual.orgaoId === 2 && '🛣️ GOPE'}
                {chamadoAtual.orgaoId === 3 && '💧 COMPESA'}
                {chamadoAtual.orgaoId === 4 && '⚡ Energisa'}
                {chamadoAtual.orgaoId === 5 && '🚦 DETRAN-PE'}
              </Text>
            </Box>
          </SimpleGrid>

          <Divider />

          {/* Barra SLA */}
          <Card bg="gray.50">
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" width="100%">
                  <Text fontSize="sm" fontWeight="bold">
                    ⏱️ PROGRESSO SLA
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {Math.max(
                      0,
                      chamadoAtual.slaHoras - (chamadoAtual.slaEncerradoHa || 0)
                    )}{' '}
                    / {chamadoAtual.slaHoras}h
                  </Text>
                </HStack>
                <Box width="100%">
                  <Box
                    bg="gray.300"
                    borderRadius="full"
                    h="8px"
                    overflow="hidden"
                    mb={2}
                  >
                    <Box
                      bg={
                        chamadoAtual.slaEncerradoHa && chamadoAtual.slaEncerradoHa < 0
                          ? 'red.500'
                          : 'green.500'
                      }
                      h="100%"
                      width={`${Math.min(
                        100,
                        ((chamadoAtual.slaHoras -
                          (chamadoAtual.slaEncerradoHa || 0)) /
                          chamadoAtual.slaHoras) *
                          100
                      )}%`}
                      transition="all 0.3s"
                    />
                  </Box>
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.600">
                      {chamadoAtual.slaEncerradoHa && chamadoAtual.slaEncerradoHa < 0
                        ? `🔴 Vencido há ${Math.abs(chamadoAtual.slaEncerradoHa)}h`
                        : `🟢 No prazo`}
                    </Text>
                    <Text fontSize="xs" fontWeight="bold">
                      {Math.round(
                        ((chamadoAtual.slaHoras -
                          (chamadoAtual.slaEncerradoHa || 0)) /
                          chamadoAtual.slaHoras) *
                          100
                      )}
                      %
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Divider />
          <VStack align="start" spacing={4} width="100%">
            <Heading size="sm">📅 Histórico do Chamado</Heading>
            {chamadoAtual.timeline && chamadoAtual.timeline.length > 0 ? (
              <Box width="100%" pl={4} borderLeftWidth="3px" borderLeftColor="primary.500">
                <VStack align="stretch" spacing={5}>
                  {chamadoAtual.timeline.map((evento) => {
                    const iconMap: Record<string, string> = {
                      criacao: '📝',
                      status: '🔄',
                      mensagem: '💬',
                      transferencia: '↪️',
                      conclusao: '✅',
                    }
                    return (
                      <Box key={evento.id} position="relative">
                        <Box
                          position="absolute"
                          left="-16px"
                          top="0"
                          width="24px"
                          height="24px"
                          bg="white"
                          borderRadius="full"
                          border="3px solid"
                          borderColor="primary.500"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                        >
                          {iconMap[evento.tipo] || '•'}
                        </Box>
                        <VStack align="start" spacing={1}>
                          <HStack justify="space-between" width="100%">
                            <Text fontWeight="bold" fontSize="sm">
                              {evento.titulo ||
                                evento.tipo.charAt(0).toUpperCase() + evento.tipo.slice(1)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {evento.timestamp || evento.data
                                ? new Date(
                                    evento.timestamp || evento.data || ''
                                  ).toLocaleDateString('pt-BR')
                                : 'Hoje'}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.700">
                            {evento.descricao}
                          </Text>
                          {(evento.usuario || evento.autor) && (
                            <Text fontSize="xs" color="gray.500">
                              Por: {evento.usuario || evento.autor}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    )
                  })}
                </VStack>
              </Box>
            ) : (
              <Text color="gray.500">Sem eventos registrados</Text>
            )}
          </VStack>

          {/* Seção de Mensagens do Gestor */}
          <Card bg="blue.50" borderTopWidth="3px" borderTopColor="primary.500">
            <CardBody>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Text fontSize="sm" fontWeight="bold">
                    💬 MENSAGENS DO GESTOR
                  </Text>
                  <Badge colorScheme="blue">1 mensagem</Badge>
                </HStack>

                <Box
                  bg="white"
                  p={3}
                  borderRadius="md"
                  width="100%"
                  borderLeftWidth="4px"
                  borderLeftColor="primary.500"
                >
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" width="100%">
                      <HStack>
                        <Avatar size="sm" name="João Silva" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">
                            João Silva
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            Gestor - PMR
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Há 2 horas
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.700">
                      Seu chamado foi recebido pela nossa equipe. Estamos investigando o local e em breve
                      você receberá um retorno com a solução.
                    </Text>
                  </VStack>
                </Box>

                <Box width="100%">
                  <Text fontSize="xs" color="gray.600" mb={2}>
                    Deixe uma mensagem:
                  </Text>
                  <HStack spacing={2}>
                    <Input
                      placeholder="Digite sua mensagem..."
                      size="sm"
                      borderRadius="md"
                    />
                    <Button size="sm" colorScheme="primary">
                      Enviar
                    </Button>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          {isChamadoNovo && (
            <HStack spacing={3} justify="center" pt={4}>
              <Link href="/cidadao/chamados">
                <Button variant="outline" colorScheme="primary">
                  ← Voltar para Meus Chamados
                </Button>
              </Link>
              <Link href="/cidadao/chamados/novo">
                <Button colorScheme="primary">
                  ✨ Criar Outro Chamado
                </Button>
              </Link>
            </HStack>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
