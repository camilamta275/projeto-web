'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Divider,
  Badge,
} from '@chakra-ui/react'
import type { Usuario } from '@/types'
import { formatDate } from '@/utils/dateFormatter'

interface CitizenAccountInfoProps {
  usuario: Usuario
}

const PERFIL_LABELS: Record<Usuario['perfil'], string> = {
  'Cidadão': 'Cidadão',
  Gestor: 'Gestor',
  Admin: 'Administrador',
}

interface InfoFieldProps {
  label: string
  value: string
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="medium" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
        {label}
      </Text>
      <Text fontSize="md" color="gray.800">
        {value}
      </Text>
    </Box>
  )
}

export function CitizenAccountInfo({ usuario }: CitizenAccountInfoProps) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
      overflow="hidden"
    >
      <Box bg="primary.50" px={{ base: 4, md: 6 }} py={6}>
        <HStack spacing={4}>
          <Avatar name={usuario.nome} size="lg" bg="primary.500" color="white" />
          <VStack align="start" spacing={1}>
            <Heading as="h2" size="md" color="gray.800">
              {usuario.nome}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {usuario.email}
            </Text>
            <Badge colorScheme="blue" fontSize="xs">
              {PERFIL_LABELS[usuario.perfil]}
            </Badge>
          </VStack>
        </HStack>
      </Box>

      <Divider />

      <VStack align="stretch" spacing={5} px={{ base: 4, md: 6 }} py={6}>
        <InfoField label="Nome completo" value={usuario.nome} />
        <InfoField label="E-mail" value={usuario.email} />
        <InfoField label="Perfil" value={PERFIL_LABELS[usuario.perfil]} />
        <InfoField label="Membro desde" value={formatDate(usuario.criadoEm)} />
        <InfoField label="Status da conta" value={usuario.status} />
      </VStack>
    </Box>
  )
}
