'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Select,
  Button,
  SimpleGrid,
  Spinner,
  Tabs,
  TabList,
  Tab,
  InputGroup,
  InputLeftElement,
  useMediaQuery,
  Checkbox,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon } from '@chakra-ui/icons'
import Link from 'next/link'
import { useChamadosStore } from '@/stores/chamadosStore'
import { useAuthStore } from '@/stores/authStore'
import { ChamadoCardV2 } from '@/components/chamados/ChamadoCardV2'
import { KPICard } from '@/components/chamados/KPICard'
import type { StatusChamado } from '@/types'

const statuses: StatusChamado[] = [
  'Aberto',
  'Em Análise',
  'Em Andamento',
  'Aguardando',
  'Resolvido',
  'Fechado',
]

export default function ChamadosPage() {
  const { usuario } = useAuthStore()
  const { chamados, loading, fetchChamados } = useChamadosStore()
  const [isDesktop] = useMediaQuery('(min-width: 768px)')

  const [busca, setBusca] = React.useState('')
  const [filtroStatus, setFiltroStatus] = React.useState<StatusChamado | ''>('')
  const [filtroOrgao, setFiltroOrgao] = React.useState('todos')
  const [ordenacao, setOrdenacao] = React.useState('recentes')
  const [somenteMeus, setSomenteMeus] = React.useState(true)

  React.useEffect(() => {
    fetchChamados()
  }, [fetchChamados])

  // Base de chamados considerando toggle "Somente meus"
  const baseChamados = React.useMemo(() => {
    if (somenteMeus && usuario?.id) {
      return chamados.filter((c) => c.cidadaoId === usuario.id)
    }
    return chamados
  }, [chamados, somenteMeus, usuario])

  // Filtrar chamados
  const chamadosFiltrados = React.useMemo(() => {
    let resultado = baseChamados

    // Filtro de busca
    if (busca) {
      resultado = resultado.filter(
        (c) =>
          c.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
          c.endereco.toLowerCase().includes(busca.toLowerCase()) ||
          c.descricao.toLowerCase().includes(busca.toLowerCase())
      )
    }

    // Filtro de status
    if (filtroStatus) {
      resultado = resultado.filter((c) => c.status === filtroStatus)
    }

    // Filtro de órgão
    if (filtroOrgao !== 'todos') {
      resultado = resultado.filter((c) => c.orgaoId === filtroOrgao)
    }

    // Ordenação
    if (ordenacao === 'recentes') {
      resultado = [...resultado].sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      )
    } else if (ordenacao === 'vencimento') {
      resultado = [...resultado].sort(
        (a, b) => (a.slaEncerradoHa || 999) - (b.slaEncerradoHa || 999)
      )
    }

    return resultado
  }, [baseChamados, busca, filtroStatus, filtroOrgao, ordenacao])

  // Contar por status
  const contadorStatus = React.useMemo(() => {
    return {
      aberto: baseChamados.filter((c) => c.status === 'Aberto').length,
      analise: baseChamados.filter((c) => c.status === 'Em Análise').length,
      andamento: baseChamados.filter((c) => c.status === 'Em Andamento').length,
    }
  }, [baseChamados])

  return (
    <Box>
      {/* Header com Gradiente */}
      <Box
        bg="linear-gradient(135deg, #1a365d 0%, #2d5016 100%)"
        color="white"
        py={6}
        px={4}
      >
        <Container maxW="container.lg">
          <VStack align="start" spacing={2}>
            <Heading size="lg">Meus Chamados</Heading>
            <HStack spacing={1}>
              <Text opacity={0.8}>{usuario?.nome}</Text>
              <Text opacity={0.6}>•</Text>
              <Text opacity={0.6}>Total: {baseChamados.length} chamados</Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.lg" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Barra de Busca */}
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por protocolo ou endereço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              borderRadius="lg"
              borderWidth="2px"
            />
          </InputGroup>

          {/* KPI Cards */}
          <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
            <KPICard
              label="Aberto"
              value={contadorStatus.aberto}
              icon="📭"
              color="blue"
              bgColor="blue.50"
            />
            <KPICard
              label="Em Análise"
              value={contadorStatus.analise}
              icon="🔍"
              color="yellow"
              bgColor="yellow.50"
            />
            <KPICard
              label="Em Andamento"
              value={contadorStatus.andamento}
              icon="⚙️"
              color="purple"
              bgColor="purple.50"
            />
          </SimpleGrid>

          {/* Filtros e Ordenação */}
          <HStack spacing={3} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
            <Checkbox
              size="sm"
              colorScheme="primary"
              isChecked={somenteMeus}
              onChange={(e) => setSomenteMeus(e.target.checked)}
            >
              Somente meus
            </Checkbox>
            <Select
              placeholder="Todos os órgãos"
              value={filtroOrgao}
              onChange={(e) => setFiltroOrgao(e.target.value)}
              maxW="180px"
              size="sm"
            >
              <option value="todos">Todos os órgãos</option>
              <option value="1">PMR</option>
              <option value="2">GOPE</option>
              <option value="3">COMPESA</option>
              <option value="4">Energisa</option>
              <option value="5">DETRAN-PE</option>
            </Select>

            <Select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              maxW="150px"
              size="sm"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="vencimento">Por vencimento</option>
            </Select>

            <Box flex={1} />

            <Link href="/cidadao/chamados/novo">
              <Button
                colorScheme="primary"
                size="sm"
                leftIcon={<AddIcon />}
                display={{ base: 'none', md: 'flex' }}
              >
                Novo Chamado
              </Button>
            </Link>
          </HStack>

          {/* Abas de Status */}
          <Box bg="gray.50" borderRadius="lg" p={3}>
            <Tabs
              variant="soft-rounded"
              colorScheme="primary"
              onChange={(index) => {
                if (index === 0) setFiltroStatus('')
                else setFiltroStatus(statuses[index - 1])
              }}
            >
              <TabList gap={1} flexWrap="wrap">
                <Tab fontSize="xs" px={3}>
                  Todos ({baseChamados.length})
                </Tab>
                {statuses.map((status) => (
                  <Tab key={status} fontSize="xs" px={3}>
                    {status} ({baseChamados.filter((c) => c.status === status).length})
                  </Tab>
                ))}
              </TabList>
            </Tabs>
          </Box>

          {/* Lista de Chamados */}
          {loading ? (
            <VStack justify="center" py={12}>
              <Spinner size="lg" color="primary.500" />
              <Text>Carregando chamados...</Text>
            </VStack>
          ) : chamadosFiltrados.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.500" mb={4}>
                {busca
                  ? '❌ Nenhum chamado encontrado com esse filtro'
                  : '✨ Nenhum chamado aberto'}
              </Text>
              <Link href="/cidadao/chamados/novo">
                <Button colorScheme="primary">Criar Primeiro Chamado</Button>
              </Link>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {chamadosFiltrados.map((chamado) => (
                <Link key={chamado.id} href={`/cidadao/chamados/${chamado.id}`}>
                  <ChamadoCardV2 chamado={chamado} />
                </Link>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>

      {/* FAB - Novo Chamado (Mobile) */}
      {!isDesktop && (
        <Link href="/cidadao/chamados/novo">
          <Box
            position="fixed"
            bottom="90px"
            right={4}
            zIndex={40}
          >
            <Button
              size="lg"
              borderRadius="full"
              bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)"
              color="white"
              boxShadow="lg"
              _hover={{ transform: 'scale(1.1)' }}
              onClick={() => {}}
            >
              <AddIcon boxSize={6} />
            </Button>
          </Box>
        </Link>
      )}
    </Box>
  )
}
