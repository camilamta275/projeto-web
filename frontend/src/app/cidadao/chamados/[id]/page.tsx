'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Divider,
  Spinner,
  Image,
  SimpleGrid,
  Tag,
  IconButton,
  Icon,
  type IconProps,
} from '@chakra-ui/react'
import { ArrowBackIcon, TimeIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useChamadosStore } from '@/stores/chamadosStore'
import { StatusBadge } from '@/components/chamados/StatusBadge'
import { TicketTimeline } from '@/components/chamados/TicketTimeline'
import { CATEGORIES, PRIORITY_LABELS, getSlaInfo } from '@/lib/mock-data'
import type { Chamado, StatusChamado } from '@/types'

// ── Custom SVG icons (avoids external dependency) ─────────────────────────────

const MapPinIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
    />
  </Icon>
)

const BuildingIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zm-8 4H7v-2h2v2zm0-4H7V9h2v2zm0-4H7V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"
    />
  </Icon>
)

const ImageFallbackIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
    />
  </Icon>
)

// ── Progress helpers ───────────────────────────────────────────────────────────

const PROGRESS_STEPS: StatusChamado[] = ['Aberto', 'Em Análise', 'Em Andamento', 'Resolvido']

function getProgressPct(chamado: Chamado, expired: boolean) {
  const s = chamado.status
  let pct: number
  if (s === 'Resolvido' || s === 'Fechado') {
    pct = 100
  } else if (s === 'Aguardando') {
    pct = 62
  } else {
    const idx = PROGRESS_STEPS.indexOf(s)
    pct = idx >= 0 ? ((idx + 1) / PROGRESS_STEPS.length) * 100 : 25
  }
  const color =
    s === 'Resolvido' || s === 'Fechado'
      ? 'status.done'
      : expired
      ? 'status.critical'
      : 'primary.500'
  return { pct, color }
}

const PRIORITY_SCHEME: Record<string, string> = {
  Crítica: 'red',
  Alta: 'yellow',
  Média: 'orange',
  Baixa: 'blue',
}

const MotionDiv = motion.div

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChamadoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { chamadoAtual, loading, fetchChamadoPorId } = useChamadosStore()

  React.useEffect(() => {
    if (params.id) fetchChamadoPorId(params.id as string)
  }, [params.id, fetchChamadoPorId])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" pt={16}>
        <Spinner size="lg" color="primary.500" />
      </Box>
    )
  }

  if (!chamadoAtual) {
    return (
      <Container maxW="lg" py={12}>
        <Text textAlign="center" color="muted.foreground">
          Chamado não encontrado
        </Text>
      </Container>
    )
  }

  const sla = getSlaInfo(chamadoAtual)
  const isResolved = chamadoAtual.status === 'Resolvido' || chamadoAtual.status === 'Fechado'
  const category = CATEGORIES[chamadoAtual.categoria] ?? {
    label: chamadoAtual.categoria as string,
    emoji: '📋',
  }
  const { pct, color: progressColor } = getProgressPct(chamadoAtual, sla.expired)
  const hasPhoto = !!(chamadoAtual.fotoUrl || chamadoAtual.foto)

  return (
    <Box minH="100vh" bg="gray.50">
      {/* ── Sticky header ─────────────────────────────────────── */}
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bg="card"
        borderBottom="1px solid"
        borderColor="border"
        px={4}
        py={3}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <IconButton
              aria-label="Voltar"
              icon={<ArrowBackIcon />}
              variant="ghost"
              size="sm"
              onClick={() => router.push('/cidadao/chamados')}
            />
            <VStack align="start" spacing={0}>
              <Heading size="sm">{chamadoAtual.protocolo}</Heading>
              <Text fontSize="xs" color="muted.foreground">
                {category.label}
              </Text>
            </VStack>
          </HStack>
          <StatusBadge status={chamadoAtual.status} />
        </HStack>
      </Box>

      {/* ── Content ───────────────────────────────────────────── */}
      <Container maxW="lg" px={4} py={4}>
        <VStack spacing={4} align="stretch">

          {/* 3. Photo */}
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0 }}
          >
            <Box borderRadius="xl" overflow="hidden" h={48}>
              {hasPhoto ? (
                <Image
                  src={(chamadoAtual.fotoUrl ?? chamadoAtual.foto) as string}
                  alt=""
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                <Box
                  bg="secondary.50"
                  w="100%"
                  h="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <ImageFallbackIcon boxSize={10} color="gray.300" />
                </Box>
              )}
            </Box>
          </MotionDiv>

          {/* 4. Info card */}
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            <Box
              bg="card"
              borderRadius="xl"
              p={4}
              borderWidth={1}
              borderColor="border"
              sx={{ backdropFilter: 'blur(8px)' }}
            >
              <HStack spacing={3} mb={3}>
                <Text fontSize="2xl" lineHeight={1}>{category.emoji}</Text>
                <VStack align="start" spacing={0} flex={1} minW={0}>
                  <Text fontWeight="semibold">{category.label}</Text>
                  <Text fontSize="sm" color="muted.foreground" noOfLines={2}>
                    {chamadoAtual.descricao}
                  </Text>
                </VStack>
              </HStack>

              <Divider borderColor="border" opacity={0.5} mb={3} />

              <SimpleGrid columns={2} spacing={3}>
                <HStack spacing={2} minW={0}>
                  <MapPinIcon boxSize={4} color="muted.foreground" flexShrink={0} />
                  <Text fontSize="sm" color="muted.foreground" noOfLines={1}>
                    {chamadoAtual.endereco}
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <TimeIcon boxSize={4} color="muted.foreground" flexShrink={0} />
                  <Text fontSize="sm" color="muted.foreground">
                    {new Date(chamadoAtual.criadoEm).toLocaleDateString('pt-BR')}
                  </Text>
                </HStack>

                <HStack spacing={2} minW={0}>
                  <BuildingIcon boxSize={4} color="muted.foreground" flexShrink={0} />
                  <Text fontSize="sm" color="muted.foreground" noOfLines={1}>
                    {String(chamadoAtual.orgaoId)}
                  </Text>
                </HStack>

                <Tag
                  size="sm"
                  borderRadius="full"
                  colorScheme={PRIORITY_SCHEME[chamadoAtual.prioridade] ?? 'gray'}
                  alignSelf="center"
                >
                  {PRIORITY_LABELS[chamadoAtual.prioridade] ?? chamadoAtual.prioridade}
                </Tag>
              </SimpleGrid>
            </Box>
          </MotionDiv>

          {/* 5. SLA block */}
          {!isResolved && (
            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <HStack
                justify="space-between"
                p={3}
                borderRadius="lg"
                bg={sla.expired ? 'status.criticalBg' : 'status.openBg'}
                color={sla.expired ? 'status.critical' : 'status.open'}
              >
                <HStack spacing={2}>
                  <TimeIcon boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium">
                    {sla.expired ? 'Prazo encerrado' : 'Prazo de atendimento'}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold">
                  {sla.label}
                </Text>
              </HStack>
            </MotionDiv>
          )}

          {/* 6. SLA justification */}
          {sla.expired && chamadoAtual.slaJustification && (
            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              <Box bg="secondary.50" p={3} borderRadius="lg" fontSize="xs" color="muted.foreground">
                <Text as="span" fontWeight="medium" color="foreground">
                  Motivo do atraso:{' '}
                </Text>
                {chamadoAtual.slaJustification}
              </Box>
            </MotionDiv>
          )}

          {/* 7. Status progress bar */}
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.23 }}
          >
            <VStack spacing={1} align="stretch">
              <HStack justify="space-between">
                {['Aberto', 'Análise', 'Execução', 'Resolvido'].map((label) => (
                  <Text key={label} fontSize="10px" color="muted.foreground">
                    {label}
                  </Text>
                ))}
              </HStack>
              <Box h={2} bg="secondary.50" borderRadius="full" overflow="hidden">
                <Box h="100%" bg={progressColor} transition="all 0.3s" width={`${pct}%`} />
              </Box>
            </VStack>
          </MotionDiv>

          {/* 8. Resolution */}
          {chamadoAtual.resolutionNote && (
            <MotionDiv
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.28 }}
            >
              <Box
                bg="card"
                borderRadius="xl"
                p={4}
                borderWidth={1}
                borderColor="border"
                sx={{ backdropFilter: 'blur(8px)' }}
              >
                <Heading size="sm" mb={2}>
                  Resolução
                </Heading>
                <Text fontSize="sm" color="muted.foreground">
                  {chamadoAtual.resolutionNote}
                </Text>
                {chamadoAtual.resolutionPhotoUrl && (
                  <Image
                    src={chamadoAtual.resolutionPhotoUrl}
                    alt=""
                    h={32}
                    w="100%"
                    borderRadius="lg"
                    objectFit="cover"
                    mt={3}
                  />
                )}
              </Box>
            </MotionDiv>
          )}

          {/* 9. Timeline */}
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
          >
            <VStack align="stretch" spacing={3}>
              <Heading size="md">Histórico</Heading>
              <TicketTimeline events={chamadoAtual.timeline} />
            </VStack>
          </MotionDiv>

        </VStack>
      </Container>
    </Box>
  )
}
