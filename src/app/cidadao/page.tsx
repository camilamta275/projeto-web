'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  IconButton,
  Button,
  Spinner,
  Icon,
  type IconProps,
} from '@chakra-ui/react'
import { SearchIcon, AddIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useChamadosStore } from '@/stores/chamadosStore'
import { useAuthStore } from '@/stores/authStore'
import { StatusBadge } from '@/components/chamados/StatusBadge'
import { ChamadoCard } from '@/components/chamados/ChamadoCardV2'
import { NotificationBell } from '@/components/NotificationBell'
import { STATUS_LABELS } from '@/lib/mock-data'
import type { StatusChamado } from '@/types'
import dbData from '@/mocks/db.json'

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: StatusChamado[] = [
  'Aberto',
  'Em Análise',
  'Em Andamento',
  'Aguardando',
  'Resolvido',
  'Fechado',
]

const SORT_OPTIONS = [
  { key: 'recent',   label: 'Mais recentes' },
  { key: 'oldest',   label: 'Mais antigos' },
  { key: 'sla',      label: 'Por prazo' },
  { key: 'priority', label: 'Por prioridade' },
] as const

const PRIORITY_ORDER: Record<string, number> = {
  Crítica: 0,
  Alta: 1,
  Média: 2,
  Baixa: 3,
}

const SUMMARY_STATUSES: StatusChamado[] = ['Aberto', 'Em Análise', 'Em Andamento']

// ── Custom icon ───────────────────────────────────────────────────────────────

const UserIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
    />
  </Icon>
)

const MotionDiv = motion.div

type SortKey = typeof SORT_OPTIONS[number]['key']

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CidadaoDashboard() {
  const router = useRouter()
  const { usuario } = useAuthStore()
  const { chamados, loading, fetchChamados } = useChamadosStore()

  const [statusFilter, setStatusFilter] = React.useState<Set<StatusChamado>>(new Set())
  const [orgFilter, setOrgFilter] = React.useState('all')
  const [sortBy, setSortBy] = React.useState<SortKey>('recent')
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    fetchChamados()
  }, [fetchChamados])

  const toggleStatus = (s: StatusChamado) => {
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const filteredTickets = React.useMemo(() => {
    let result = chamados

    if (statusFilter.size > 0)
      result = result.filter((c) => statusFilter.has(c.status))

    if (orgFilter !== 'all')
      result = result.filter((c) => String(c.orgaoId) === orgFilter)

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.protocolo.toLowerCase().includes(q) ||
          c.endereco.toLowerCase().includes(q)
      )
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
        case 'sla':
          return (a.slaHoras ?? 999) - (b.slaHoras ?? 999)
        case 'priority':
          return (PRIORITY_ORDER[a.prioridade] ?? 4) - (PRIORITY_ORDER[b.prioridade] ?? 4)
        default:
          return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      }
    })
  }, [chamados, statusFilter, orgFilter, search, sortBy])

  const firstName = usuario?.nome?.split(' ')[0] ?? 'Cidadão'

  return (
    <Box minH="100vh" bg="gray.50" pb="100px">

      {/* ── Gov gradient header ──────────────────────────────── */}
      <Box
        bg="linear-gradient(135deg, #1a365d 0%, #2d5016 100%)"
        color="white"
        px={4}
        pt={6}
        pb={10}
      >
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" opacity={0.8}>Olá, {firstName} 👋</Text>
            <Heading size="md" fontWeight="bold">Meus Chamados</Heading>
          </VStack>
          <HStack spacing={2}>
            <NotificationBell role="citizen" />
            <IconButton
              aria-label="Perfil"
              icon={<UserIcon />}
              variant="ghost"
              isRound
              bg="whiteAlpha.200"
              color="white"
              _hover={{ bg: 'whiteAlpha.300' }}
              onClick={() => router.push('/')}
            />
          </HStack>
        </HStack>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="whiteAlpha.700" />
          </InputLeftElement>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por protocolo ou endereço..."
            bg="whiteAlpha.200"
            color="white"
            borderColor="whiteAlpha.300"
            borderRadius="lg"
            _placeholder={{ color: 'whiteAlpha.600' }}
            aria-label="Buscar chamados"
          />
        </InputGroup>
      </Box>

      {/* ── Content overlapping header ───────────────────────── */}
      <Box px={4} mt={-6}>

        {/* Status chips */}
        <HStack
          overflowX="auto"
          pb={3}
          spacing={2}
          sx={{ '::-webkit-scrollbar': { display: 'none' } }}
        >
          {ALL_STATUSES.map((s) => {
            const selected = statusFilter.has(s)
            return (
              <Button
                key={s}
                size="sm"
                borderRadius="full"
                flexShrink={0}
                fontSize="xs"
                fontWeight="medium"
                bg={selected ? 'primary.500' : 'card'}
                color={selected ? 'white' : 'muted.foreground'}
                borderWidth={selected ? 0 : 1}
                borderColor="border"
                _hover={{ bg: selected ? 'primary.600' : 'gray.100' }}
                onClick={() => toggleStatus(s)}
                aria-pressed={selected}
              >
                {STATUS_LABELS[s]}
              </Button>
            )
          })}
        </HStack>

        {/* Org + sort filters */}
        <HStack spacing={2} mb={4}>
          <Select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            flex={1}
            size="sm"
            bg="card"
            borderColor="border"
            fontSize="xs"
          >
            <option value="all">Todos os órgãos</option>
            {dbData.orgaos.map((org) => (
              <option key={org.id} value={String(org.id)}>
                {org.sigla} — {org.nome}
              </option>
            ))}
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            size="sm"
            bg="card"
            borderColor="border"
            fontSize="xs"
            w="auto"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </Select>
        </HStack>

        {/* Summary cards */}
        <SimpleGrid columns={3} spacing={2} mb={4}>
          {SUMMARY_STATUSES.map((s) => (
            <Box
              key={s}
              bg="card"
              borderRadius="lg"
              p={3}
              textAlign="center"
              borderWidth={1}
              borderColor="border"
              sx={{ backdropFilter: 'blur(8px)' }}
            >
              <Text fontSize="lg" fontWeight="bold" color="foreground">
                {chamados.filter((t) => t.status === s).length}
              </Text>
              <StatusBadge status={s} fontSize="10px" px={1.5} py={0.5} mt={1} />
            </Box>
          ))}
        </SimpleGrid>

        {/* Ticket list */}
        {loading ? (
          <VStack justify="center" py={12}>
            <Spinner size="lg" color="primary.500" />
          </VStack>
        ) : filteredTickets.length === 0 ? (
          <Box textAlign="center" py={12} color="muted.foreground" fontSize="sm">
            Nenhum chamado encontrado
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {filteredTickets.map((chamado, i) => (
              <MotionDiv
                key={chamado.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <ChamadoCard
                  chamado={chamado}
                  onClick={() => router.push(`/cidadao/chamados/${chamado.id}`)}
                />
              </MotionDiv>
            ))}
          </VStack>
        )}
      </Box>

      {/* ── FAB ──────────────────────────────────────────────── */}
      <IconButton
        aria-label="Novo chamado"
        icon={<AddIcon boxSize={5} />}
        position="fixed"
        bottom="90px"
        right={6}
        h={14}
        w={14}
        isRound
        bg="primary.500"
        color="white"
        boxShadow="xl"
        zIndex={50}
        _hover={{ bg: 'primary.600', transform: 'scale(1.05)' }}
        transition="all 0.2s"
        onClick={() => router.push('/cidadao/chamados/novo')}
      />
    </Box>
  )
}
