'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  MenuDivider,
} from '@chakra-ui/react'
import { useNotificacoesStore } from '@/stores/notificacoesStore'
import { formatTimeAgo } from '@/utils/dateFormatter'

export function HeaderCidadao() {
  const router = useRouter()
  const { notificacoes, loading, error, marcarComoLida } = useNotificacoesStore()

  const naoLidas = notificacoes.filter((n) => !n.lida)

  const handleNotificacaoClick = async (id: string, chamadoId?: string) => {
    await marcarComoLida(id)
    if (chamadoId) {
      router.push(`/cidadao/chamados/${chamadoId}`)
    }
  }

  return (
    <header className="flex items-center justify-between w-full px-6 py-4 bg-white shadow-sm">
      <Button
        variant="ghost"
        onClick={() => router.push('/login')}
        className="hover:bg-gray-100 transition-colors"
        leftIcon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        }
      >
        Voltar para o Login
      </Button>

      <Menu>
        <Box position="relative">
          <MenuButton
            as={IconButton}
            variant="ghost"
            aria-label="Notificações"
            className="hover:bg-gray-100 rounded-full transition-colors"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            }
          />
          {naoLidas.length > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-2px"
              right="-2px"
              fontSize="0.6em"
              px={1.5}
            >
              {naoLidas.length}
            </Badge>
          )}
        </Box>

        <MenuList className="shadow-lg rounded-md" maxH="400px" overflowY="auto" width="350px" p={2}>
          <Text fontWeight="bold" className="px-4 py-2 text-gray-700">
            Notificações
          </Text>
          <MenuDivider />

          {loading && (
            <Box className="flex justify-center p-4">
              <Spinner size="sm" color="blue.500" />
            </Box>
          )}

          {error && (
            <Text color="red.500" className="p-4 text-sm text-center">
              {error}
            </Text>
          )}

          {!loading && notificacoes.length === 0 && (
            <Text className="p-4 text-sm text-gray-500 text-center">
              Nenhuma notificação encontrada.
            </Text>
          )}

          {!loading && notificacoes.slice(0, 5).map((notif) => (
            <MenuItem
              key={notif.id}
              onClick={() => handleNotificacaoClick(notif.id, notif.chamadoId)}
              className={`rounded-md mb-1 transition-colors ${
                notif.lida ? 'bg-transparent hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
              }`}
              p={3}
            >
              <VStack align="start" spacing={1} width="100%">
                <HStack justify="space-between" width="100%">
                  <Text fontWeight={notif.lida ? 'medium' : 'bold'} fontSize="sm" className="text-gray-800">
                    {notif.titulo}
                  </Text>
                  {!notif.lida && (
                    <Box width="8px" height="8px" borderRadius="full" bg="blue.500" flexShrink={0} />
                  )}
                </HStack>
                <Text fontSize="xs" className="text-gray-600 line-clamp-2">
                  {notif.mensagem}
                </Text>
                <Text fontSize="xs" className="text-gray-400 mt-1">
                  {notif.criadoEm ? formatTimeAgo(notif.criadoEm) : ''}
                </Text>
              </VStack>
            </MenuItem>
          ))}

          <MenuDivider />
          <MenuItem
            onClick={() => router.push('/cidadao/notificacoes')}
            className="justify-center text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium"
          >
            Ver todas as notificações
          </MenuItem>
        </MenuList>
      </Menu>
    </header>
  )
}