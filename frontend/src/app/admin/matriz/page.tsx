'use client'

import React from 'react'
import {
  Badge, Box, Button, Container, FormControl, FormErrorMessage,
  FormLabel, Heading, HStack, IconButton, Input, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Select, SimpleGrid, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr,
  useDisclosure, useToast, VStack, AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { api } from '@/lib/api'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Orgao {
  id: string
  sigla: string
  nome: string
  slaDefault: number
  status: string
}

interface Categoria {
  id: number
  nome: string
}

interface Rule {
  id: string
  categoria: { id: number; nome: string }
  subcategoria: string
  orgaoPrincipal: { id: string; sigla: string; nome: string }
  orgaoSecundario: { id: string; sigla: string; nome: string } | null
  sla: number
  prioridade: string
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  'Infraestrutura': '🏗️',
  'Água e Esgoto': '💧',
  'Iluminação Pública': '💡',
  'Saneamento Básico': '🗑️',
  'Sinalização': '🚦',
  'Outros Problemas': '📌',
}

const priorityMap: Record<string, { label: string; colorScheme: string }> = {
  Critica: { label: 'Crítica', colorScheme: 'red' },
  Alta: { label: 'Alta', colorScheme: 'orange' },
  Media: { label: 'Média', colorScheme: 'yellow' },
  Baixa: { label: 'Baixa', colorScheme: 'blue' },
}

function emptyForm() {
  return {
    orgaoprincipalId: '',
    categoriaId: '',
    subcategoria: '',
    slaHoras: '',
    prioridade: 'Media',
  }
}

function emptyErrors() {
  return {
    orgaoprincipalId: '',
    categoriaId: '',
    subcategoria: '',
    slaHoras: '',
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function MatrizPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Dados
  const [orgaos, setOrgaos] = React.useState<Orgao[]>([])
  const [categorias, setCategorias] = React.useState<Categoria[]>([])
  const [rules, setRules] = React.useState<Rule[]>([])
  const [categoriasFiltradas, setCategoriasFiltradas] = React.useState<Categoria[]>([])

  // Estado do modal
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState(emptyForm())
  const [errors, setErrors] = React.useState(emptyErrors())
  const [loadingCategorias, setLoadingCategorias] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Filtros da tabela
  const [filterOrg, setFilterOrg] = React.useState('')
  const [filterCat, setFilterCat] = React.useState('')

  // ─── Inicialização ────────────────────────────────────────────────────────

  React.useEffect(() => {
    fetchOrgaos()
    fetchCategorias()
  }, [])

  React.useEffect(() => {
    fetchRules()
  }, [filterOrg, filterCat])

  // Quando o órgão muda no formulário, busca as categorias associadas
  React.useEffect(() => {
    if (!form.orgaoprincipalId) {
      setCategoriasFiltradas([])
      setForm((f) => ({ ...f, categoriaId: '', slaHoras: '' }))
      return
    }
    fetchCategoriasPorOrgao(form.orgaoprincipalId)
  }, [form.orgaoprincipalId])

  // Quando a categoria muda, limpa subcategoria (só em criação)
  React.useEffect(() => {
    if (!editingId) {
      setForm((f) => ({ ...f, subcategoria: '' }))
    }
  }, [form.categoriaId])

  // ─── API ──────────────────────────────────────────────────────────────────

  async function fetchOrgaos() {
    api.get('/admin/organs?status=ativo')
      .then(({ data }) => setOrgaos(data))
      .catch(() => toast({ title: 'Erro ao carregar órgãos.', status: 'error', duration: 3000 }))
  }

  async function fetchCategorias() {
    api.get('/categories')
      .then(({ data }) => setCategorias(data))
      .catch(() => toast({ title: 'Erro ao carregar categorias.', status: 'error', duration: 3000 }))
  }

  async function fetchRules() {
    try {
      const params = new URLSearchParams()
      if (filterOrg) params.set('organ_id', filterOrg)
      if (filterCat) params.set('category_id', filterCat)

      const { data } = await api.get(`/admin/routing-rules?${params.toString()}`)
      setRules(data.regras ?? data)
    } catch {
      toast({ title: 'Erro ao carregar regras.', status: 'error', duration: 3000 })
    }
  }

  async function fetchCategoriasPorOrgao(orgaoId: string) {
    setLoadingCategorias(true)
    setCategoriasFiltradas([])
    try {
      const { data } = await api.get(`/admin/organs/${orgaoId}/categories`)
      setCategoriasFiltradas(data)

      // Preenche SLA padrão apenas em criação
      if (!editingId) {
        const orgao = orgaos.find((o) => o.id === orgaoId)
        if (orgao) setForm((f) => ({ ...f, slaHoras: String(orgao.slaDefault) }))
      }
    } catch {
      toast({ title: 'Erro ao buscar categorias do órgão.', status: 'error', duration: 3000 })
    } finally {
      setLoadingCategorias(false)
    }
  }

  // ─── Validação ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const next = emptyErrors()
    let valid = true

    if (!form.orgaoprincipalId) {
      next.orgaoprincipalId = 'Selecione um órgão principal.'
      valid = false
    }
    if (!form.categoriaId) {
      next.categoriaId = 'Selecione uma categoria.'
      valid = false
    }
    if (!form.subcategoria.trim()) {
      next.subcategoria = 'Informe a subcategoria.'
      valid = false
    }
    if (!form.slaHoras || Number(form.slaHoras) <= 0) {
      next.slaHoras = 'Informe um SLA válido (mínimo 1 hora).'
      valid = false
    }

    setErrors(next)
    return valid
  }

  // ─── Ações do modal ───────────────────────────────────────────────────────

  function abrirModalNovaRegra() {
    setEditingId(null)
    setForm(emptyForm())
    setErrors(emptyErrors())
    setCategoriasFiltradas([])
    onOpen()
  }

  function abrirModalEdicao(rule: Rule) {
    setEditingId(rule.id)
    setErrors(emptyErrors())

    // Preenche o form com os valores atuais da regra
    setForm({
      orgaoprincipalId: rule.orgaoPrincipal.id,
      categoriaId: String(rule.categoria.id),
      subcategoria: rule.subcategoria,
      slaHoras: String(rule.sla),
      prioridade: rule.prioridade,
    })

    // Pré-carrega categorias do órgão para o select funcionar corretamente
    fetchCategoriasPorOrgaoSilencioso(rule.orgaoPrincipal.id, rule.categoria.id)

    onOpen()
  }

  // Variante silenciosa que não sobrescreve o SLA ao editar
  async function fetchCategoriasPorOrgaoSilencioso(orgaoId: string, categoriaIdAtual: number) {
    setLoadingCategorias(true)
    try {
      const { data } = await api.get(`/admin/organs/${orgaoId}/categories`)
      setCategoriasFiltradas(data)
    } catch {
      toast({ title: 'Erro ao buscar categorias do órgão.', status: 'error', duration: 3000 })
    } finally {
      setLoadingCategorias(false)
    }
  }

  function fecharModal() {
    setEditingId(null)
    setForm(emptyForm())
    setErrors(emptyErrors())
    setCategoriasFiltradas([])
    onClose()
  }

  async function salvarRegra() {
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        categoriaId: Number(form.categoriaId),
        subcategoria: form.subcategoria.trim(),
        orgaoprincipalId: form.orgaoprincipalId,
        slaHoras: Number(form.slaHoras),
        prioridade: form.prioridade,
      }

      if (editingId) {
        // ── Edição ──────────────────────────────────────────────────────────
        await api.patch(`/admin/routing-rules/${editingId}`, payload)
        toast({ title: 'Regra atualizada com sucesso!', status: 'success', duration: 3000 })
      } else {
        // ── Criação ─────────────────────────────────────────────────────────
        await api.post('/admin/routing-rules', payload)
        toast({ title: 'Regra criada com sucesso!', status: 'success', duration: 3000 })
      }

      fecharModal()
      fetchRules()

    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast({
          title: 'Regra duplicada.',
          description: error.response.data?.message ?? 'Já existe uma regra para essa categoria e subcategoria.',
          status: 'warning',
          duration: 5000,
        })
        return
      }
      toast({
        title: editingId ? 'Erro ao atualizar regra.' : 'Erro ao salvar regra.',
        description: error?.response?.data?.message || error.message || 'Não foi possível concluir a operação.',
        status: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  async function excluirRegra(id: string) {
    try {
      await api.delete(`/admin/routing-rules/${id}`)

      setRules((current) =>
        current.filter((rule) => rule.id !== id)
      )

      onDeleteClose()
      setRuleToDelete(null)

      toast({
        title: 'Regra removida com sucesso.',
        status: 'success',
        duration: 3000,
      })
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast({
          title: 'Regra não encontrada.',
          status: 'error',
          duration: 4000,
        })

        fetchRules()
        return
      }

      toast({
        title: 'Erro ao remover regra.',
        description:
          error?.response?.data?.message ||
          'Não foi possível remover a regra.',
        status: 'error',
        duration: 4000,
      })
    }
  }

  // ─── CONFIRMAR EXCLUSAO ───────────────────────────────────────────────────────────────
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const [ruleToDelete, setRuleToDelete] =
    React.useState<Rule | null>(null)

  function confirmarExclusao(rule: Rule) {
    setRuleToDelete(rule)
    onDeleteOpen()
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={6} align="stretch">

          {/* Header */}
          <HStack
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            flexDir={{ base: 'column', md: 'row' }}
            spacing={4}
          >
            <Box>
              <Heading size="lg" color="gray.800">Matriz de Competências</Heading>
              <Text color="gray.600" mt={1}>
                Define o roteamento automático de chamados por categoria, subcategoria, órgão, SLA e prioridade.
              </Text>
            </Box>
            <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={abrirModalNovaRegra}>
              Adicionar Regra
            </Button>
          </HStack>

          {/* Filtros */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" color="gray.700">Filtrar por Órgão</FormLabel>
              <Select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} bg="white">
                <option value="">Todos os órgãos</option>
                {orgaos.map((org) => (
                  <option key={org.id} value={org.id}>{org.sigla}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color="gray.700">Filtrar por Categoria</FormLabel>
              <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} bg="white">
                <option value="">Todas as categorias</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>{cat.nome}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          {/* Tabela */}
          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden">
            <Box px={{ base: 4, md: 6 }} py={3} borderBottomWidth="1px" borderColor="gray.100">
              <Text fontSize="sm" color="gray.500">{rules.length} regra(s) encontrada(s)</Text>
            </Box>

            <Box overflowX="auto">
              <Box minW="800px">
                <Table size="sm" variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Categoria</Th>
                      <Th>Subcategoria</Th>
                      <Th>Órgão Principal</Th>
                      <Th>Órgão Secundário</Th>
                      <Th>SLA</Th>
                      <Th>Prioridade</Th>
                      <Th textAlign="right">Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rules.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={10} color="gray.400">
                          Nenhuma regra encontrada.
                        </Td>
                      </Tr>
                    ) : (
                      rules.map((rule) => {
                        const priority = priorityMap[rule.prioridade] ?? priorityMap['Media']
                        const icon = CATEGORY_ICONS[rule.categoria?.nome] ?? '📌'

                        return (
                          <Tr key={rule.id} _hover={{ bg: 'gray.50' }}>
                            <Td>
                              <HStack spacing={2} fontWeight="semibold" color="gray.800">
                                <Text>{icon}</Text>
                                <Text>{rule.categoria?.nome}</Text>
                              </HStack>
                            </Td>
                            <Td color="gray.700">{rule.subcategoria}</Td>
                            <Td>
                              <Text color="blue.600" fontWeight="bold">
                                {rule.orgaoPrincipal?.sigla}
                              </Text>
                            </Td>
                            <Td color={rule.orgaoSecundario ? 'gray.600' : 'gray.300'}>
                              {rule.orgaoSecundario?.sigla ?? '—'}
                            </Td>
                            <Td color="gray.700">{rule.sla}h</Td>
                            <Td>
                              <Badge
                                colorScheme={priority.colorScheme}
                                variant="subtle"
                                borderRadius="full"
                                px={2.5} py={1}
                              >
                                {priority.label}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack justify="flex-end" spacing={1}>
                                {/* ── Editar ── */}
                                <IconButton
                                  aria-label="Editar regra"
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => abrirModalEdicao(rule)}
                                />
                                {/* ── Excluir ── */}
                                <IconButton
                                  aria-label="Excluir regra"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => confirmarExclusao(rule)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        )
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Box>

          {/* Fluxo de roteamento */}
          <Box
            bg="blue.50" borderWidth="1px" borderColor="blue.100"
            borderRadius="xl" px={{ base: 4, md: 6 }} py={5}
          >
            <Text fontSize="sm" fontWeight="semibold" color="blue.700" mb={3}>
              Fluxo de Roteamento
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {[
                'Cidadão abre chamado',
                'Categoria + Subcategoria',
                'Matriz define órgão + SLA',
                'Roteado automaticamente',
              ].map((step, index, array) => (
                <React.Fragment key={step}>
                  <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1.5}>
                    {step}
                  </Badge>
                  {index < array.length - 1 && (
                    <Text color="blue.300" fontWeight="bold">→</Text>
                  )}
                </React.Fragment>
              ))}
            </HStack>
          </Box>
        </VStack>
      </Container>

      {/* ── Modal Criar / Editar Regra ─────────────────────────────────────── */}
      <Modal isOpen={isOpen} onClose={fecharModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Editar Regra' : 'Adicionar Regra'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">

              {/* 1. Órgão Principal */}
              <FormControl isRequired isInvalid={!!errors.orgaoprincipalId}>
                <FormLabel>Órgão Principal</FormLabel>
                <Select
                  placeholder="Selecione o órgão..."
                  value={form.orgaoprincipalId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      orgaoprincipalId: e.target.value,
                      // Limpa categoria apenas em criação para não perder dado ao editar
                      categoriaId: editingId ? f.categoriaId : '',
                    }))
                  }
                >
                  {orgaos.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.sigla} — {org.nome}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.orgaoprincipalId}</FormErrorMessage>
              </FormControl>

              {/* 2. Categoria */}
              <FormControl isRequired isInvalid={!!errors.categoriaId}>
                <FormLabel>
                  Categoria
                  {loadingCategorias && <Spinner size="xs" ml={2} color="blue.500" />}
                </FormLabel>
                <Select
                  placeholder={
                    !form.orgaoprincipalId
                      ? 'Selecione um órgão primeiro'
                      : loadingCategorias
                        ? 'Carregando...'
                        : categoriasFiltradas.length === 0
                          ? 'Nenhuma categoria vinculada'
                          : 'Selecione a categoria...'
                  }
                  value={form.categoriaId}
                  onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
                  isDisabled={!form.orgaoprincipalId || loadingCategorias || categoriasFiltradas.length === 0}
                >
                  {categoriasFiltradas.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>{cat.nome}</option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.categoriaId}</FormErrorMessage>
              </FormControl>

              {/* 3. Subcategoria */}
              <FormControl isRequired isInvalid={!!errors.subcategoria}>
                <FormLabel>Subcategoria</FormLabel>
                <Input
                  value={form.subcategoria}
                  onChange={(e) => setForm((f) => ({ ...f, subcategoria: e.target.value }))}
                  placeholder="Ex: Buraco na pista"
                  isDisabled={!form.categoriaId}
                />
                <FormErrorMessage>{errors.subcategoria}</FormErrorMessage>
              </FormControl>

              {/* 4. SLA + Prioridade */}
              <SimpleGrid columns={2} spacing={4}>
                <FormControl isRequired isInvalid={!!errors.slaHoras}>
                  <FormLabel>SLA (horas)</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={form.slaHoras}
                    onChange={(e) => setForm((f) => ({ ...f, slaHoras: e.target.value }))}
                    placeholder="48"
                    isDisabled={true}
                  />
                  <FormErrorMessage>{errors.slaHoras}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Prioridade</FormLabel>
                  <Select
                    value={form.prioridade}
                    onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value }))}
                  >
                    <option value="Critica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Média</option>
                    <option value="Baixa">Baixa</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={fecharModal} isDisabled={saving}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={salvarRegra}
                isLoading={saving}
                loadingText="Salvando..."
              >
                {editingId ? 'Salvar Alterações' : 'Salvar Regra'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Modal Confirmar Exclusão / Excluir Regra ─────────────────────────────────────── */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Regra
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir esta regra de competência?

              {ruleToDelete && (
                <Text mt={3} fontWeight="semibold">
                  {ruleToDelete.categoria.nome}
                  {' > '}
                  {ruleToDelete.subcategoria}
                </Text>
              )}

              <Text mt={2} fontSize="sm" color="gray.600">
                As demandas já existentes não serão reatribuídas.
                Apenas novas demandas deixarão de utilizar esta regra.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setRuleToDelete(null)
                  onDeleteClose()
                }}
              >
                Cancelar
              </Button>

              <Button
                colorScheme="red"
                onClick={() => {
                  if (ruleToDelete) {
                    excluirRegra(ruleToDelete.id)
                  }
                }}
                ml={3}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}