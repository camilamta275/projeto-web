'use client'

import React from 'react'
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Button,
  Badge,
  Card,
  CardBody,
  Divider,

  useToast,
  Spinner,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useNotificacoesStore } from '@/stores/notificacoesStore'
import { useAuthStore } from '@/stores/authStore'
import { formatTimeAgo } from '@/utils/dateFormatter'
import { useRouter } from 'next/navigation'

const tipoIcons: Record<string, string> = {
  chamado: '📝',
  status: '🔄',
  equipe: '👥',
  concluido: '✅',
  'chamado-registrado': '📝',
  'status-atualizado': '🔄',
  'equipe-designada': '👥',
  'chamado-concluido': '✅',
}



export default function NotificacoesPage() {
  const toast = useToast()
  const router = useRouter()
  const { usuario } = useAuthStore()
  const { notificacoes, loading, fetchNotificacoes, marcarComoLida, marcarTodasComoLidas } =
    useNotificacoesStore()

  React.useEffect(() => {
    if (usuario?.id) {
      fetchNotificacoes(usuario.id)
    }
  }, [usuario?.id, fetchNotificacoes])

  const naoLidas = notificacoes.filter((n) => !n.lida)

  const handleMarcarComoLida = async (id: string) => {
    await marcarComoLida(id)
  }

  const handleCardClick = (id: string, chamadoId?: string, lida?: boolean) => {
    if (!lida) handleMarcarComoLida(id)
    if (chamadoId) {
      router.push(`/cidadao/chamados/${chamadoId}`)
    }
  }

  const handleMarcarTodasComoLidas = async () => {
    await marcarTodasComoLidas()
    toast({
      title: '✓ Todas marcadas como lidas',
      status: 'success',
      duration: 2,
      isClosable: true,
    })
  }

  if (loading) {
    return (
      <Container maxW="container.lg" py={12} display="flex" justifyContent="center">
        <Spinner size="lg" color="primary.500" />
      </Container>
    )
  }

  return (
    <Box>
      <Container maxW="container.lg" py={6}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" width="100%" mb={4}>
            <Heading size="lg">🔔 Suas Notificações</Heading>
          </HStack>

          {/* Botão Marcar Todas como Lidas */}
          {naoLidas.length > 0 && (
            <HStack justify="flex-end">
              <Button
                size="sm"
                variant="ghost"
                colorScheme="primary"
                onClick={handleMarcarTodasComoLidas}
              >
                ✓ Marcar todas como lidas
              </Button>
            </HStack>
          )}

          {/* Lista de Notificações */}
          {notificacoes.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.500" mb={2}>
                ✨ Sem notificações
              </Text>
              <Text fontSize="sm" color="gray.400">
                Você receberá notificações sobre seus chamados aqui
              </Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {notificacoes.map((notif) => (
                <Card
                  key={notif.id}
                  bg={notif.lida ? 'white' : 'blue.50'}
                  borderLeftWidth="4px"
                  borderLeftColor={notif.lida ? 'gray.200' : 'primary.500'}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ shadow: 'md', bg: notif.lida ? 'gray.50' : 'blue.100' }}
                  onClick={() => handleCardClick(notif.id, notif.chamadoId, notif.lida)}
                >
                  <CardBody>
                    <HStack spacing={4} align="start">
                      {/* Ícone */}
                      <Box fontSize="2xl" flexShrink={0}>
                        {tipoIcons[notif.tipo] || '📢'}
                      </Box>

                      {/* Conteúdo */}
                      <VStack align="start" spacing={2} flex={1} minW={0}>
                        <HStack justify="space-between" width="100%">
                          <HStack spacing={2}>
                            <Heading size="sm">{notif.titulo}</Heading>
                            {!notif.lida && (
                              <Badge colorScheme="blue" fontSize="xs">
                                Novo
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.500" flexShrink={0}>
                            {formatTimeAgo(notif.criadoEm)}
                          </Text>
                        </HStack>

                        <Text fontSize="sm" color="gray.700">
                          {notif.mensagem}
                        </Text>

                        <HStack spacing={2}>
                          {!notif.lida && (
                            <Button
                              size="xs"
                              colorScheme="primary"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarcarComoLida(notif.id)
                              }}
                            >
                              ✓ Marcar como lida
                            </Button>
                          )}
                        </HStack>
                      </VStack>

                      {/* Indicador de Leitura */}
                      {!notif.lida && (
                        <Box
                          width="8px"
                          height="8px"
                          borderRadius="full"
                          bg="primary.500"
                          flexShrink={0}
                        />
                      )}
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}

          {/* Footer */}
          <Divider my={4} />
          <HStack justify="space-between" fontSize="sm" color="gray.600">
            <Text>Total: {notificacoes.length} notificações</Text>
            <Link href="/cidadao/chamados">
              <Button size="sm" variant="outline">
                ← Voltar para Chamados
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
