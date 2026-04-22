'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Icon,
  Heading,
  Text,
  Button,
  IconButton,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  SimpleGrid,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  Stack,
  useDisclosure,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon } from '@chakra-ui/icons'
import type { IconType } from 'react-icons'
import {
  FiEdit2,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiTrash2,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { MdOutlineBusiness } from 'react-icons/md'

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'matriz' | 'orgaos' | 'usuarios'

interface Org {
  id: string
  sigla: string
  nome: string
  tipo: string
  responsavel: string
  email: string
  sla: number
  status: string
  categorias: string[]
}

interface MatrizRule {
  id: number
  categoria: string
  subcategoria: string
  orgaoPrincipal: string
  orgaoSecundario: string | null
  sla: number
  prioridade: string
}

interface User {
  id: number
  nome: string
  email: string
  perfil: string
  orgao: string | null
  status: string
  cadastro: string
}

interface MatrizForm {
  categoria: string
  subcategoria: string
  orgaoPrincipal: string
  orgaoSecundario: string
  sla: string
  prioridade: string
}

interface OrgForm {
  nome: string
  sigla: string
  tipo: string
  responsavel: string
  email: string
  sla: string
}

interface UserForm {
  nome: string
  email: string
  perfil: string
  orgao: string
  setor: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ORGS_INITIAL: Org[] = [
  { id: 'pmr', sigla: 'PMR', nome: 'Prefeitura Municipal do Recife', tipo: 'municipal', responsavel: 'João Silva', email: 'joao@prefeitura.gov.br', sla: 72, status: 'ativo', categorias: ['Problemas na Via', 'Iluminação Pública', 'Saneamento Básico', 'Sinalização'] },
  { id: 'gope', sigla: 'GOPE', nome: 'Governo do Estado de Pernambuco', tipo: 'estadual', responsavel: 'Maria Lima', email: 'maria@pe.gov.br', sla: 120, status: 'ativo', categorias: ['Problemas na Via'] },
  { id: 'compesa', sigla: 'COMPESA', nome: 'Compesa', tipo: 'concessionaria', responsavel: 'Carlos Santos', email: 'carlos@compesa.com.br', sla: 48, status: 'ativo', categorias: ['Água e Esgoto', 'Saneamento Básico'] },
  { id: 'enrg', sigla: 'ENRG', nome: 'Energisa Pernambuco', tipo: 'concessionaria', responsavel: 'Ana Costa', email: 'ana@energisa.com.br', sla: 24, status: 'ativo', categorias: ['Iluminação Pública'] },
  { id: 'detran', sigla: 'DETRAN', nome: 'DETRAN-PE', tipo: 'estadual', responsavel: 'Pedro Alves', email: 'pedro@detran.pe.gov.br', sla: 96, status: 'ativo', categorias: ['Sinalização'] },
]

const CATEGORIES = ['Problemas na Via', 'Água e Esgoto', 'Iluminação Pública', 'Saneamento Básico', 'Sinalização']

const CATEGORY_ICONS: Record<string, string> = {
  'Problemas na Via': '🏗️',
  'Água e Esgoto': '💧',
  'Iluminação Pública': '💡',
  'Saneamento Básico': '🗑️',
  'Sinalização': '🚦',
}

const MATRIX_RULES_INITIAL: MatrizRule[] = [
  { id: 1, categoria: 'Problemas na Via', subcategoria: 'Via local / municipal', orgaoPrincipal: 'PMR', orgaoSecundario: null, sla: 72, prioridade: 'media' },
  { id: 2, categoria: 'Problemas na Via', subcategoria: 'Rodovia / BR / PE', orgaoPrincipal: 'GOPE', orgaoSecundario: 'PMR', sla: 120, prioridade: 'alta' },
  { id: 3, categoria: 'Água e Esgoto', subcategoria: 'Falta de água', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 24, prioridade: 'alta' },
  { id: 4, categoria: 'Água e Esgoto', subcategoria: 'Vazamento de água', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 12, prioridade: 'critica' },
  { id: 5, categoria: 'Água e Esgoto', subcategoria: 'Esgoto a céu aberto', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 24, prioridade: 'critica' },
  { id: 6, categoria: 'Água e Esgoto', subcategoria: 'Pressão baixa', orgaoPrincipal: 'COMPESA', orgaoSecundario: null, sla: 48, prioridade: 'baixa' },
  { id: 7, categoria: 'Iluminação Pública', subcategoria: 'Poste apagado', orgaoPrincipal: 'ENRG', orgaoSecundario: null, sla: 24, prioridade: 'media' },
  { id: 8, categoria: 'Iluminação Pública', subcategoria: 'Luminária danificada', orgaoPrincipal: 'PMR', orgaoSecundario: 'ENRG', sla: 48, prioridade: 'baixa' },
  { id: 9, categoria: 'Saneamento Básico', subcategoria: 'Coleta de lixo irregular', orgaoPrincipal: 'PMR', orgaoSecundario: null, sla: 48, prioridade: 'media' },
]

const MOCK_USERS_INITIAL: User[] = [
  { id: 1, nome: 'Maria Silva', email: 'maria@email.com', perfil: 'citizen', orgao: null, status: 'ativo', cadastro: '2026-01-15' },
  { id: 2, nome: 'Carlos Santos', email: 'carlos@email.com', perfil: 'citizen', orgao: null, status: 'ativo', cadastro: '2026-02-01' },
  { id: 3, nome: 'João Gestor', email: 'joao@prefeitura.gov.br', perfil: 'manager', orgao: 'PMR', status: 'ativo', cadastro: '2026-01-01' },
  { id: 4, nome: 'Ana Costa', email: 'ana@energisa.com.br', perfil: 'manager', orgao: 'ENRG', status: 'ativo', cadastro: '2026-01-05' },
  { id: 5, nome: 'Pedro Admin', email: 'pedro@admin.gov.br', perfil: 'admin', orgao: null, status: 'ativo', cadastro: '2025-12-01' },
  { id: 6, nome: 'Lucia Ferreira', email: 'lucia@email.com', perfil: 'citizen', orgao: null, status: 'ativo', cadastro: '2026-03-10' },
  { id: 7, nome: 'Roberto Almeida', email: 'roberto@email.com', perfil: 'citizen', orgao: null, status: 'inativo', cadastro: '2026-02-20' },
  { id: 8, nome: 'Marcos Gestor', email: 'marcos@compesa.com.br', perfil: 'manager', orgao: 'COMPESA', status: 'ativo', cadastro: '2026-01-10' },
]

const NAV_ITEMS: Array<{ id: TabId; label: string; icon: IconType }> = [
  { id: 'matriz', label: 'Matriz de Competências', icon: FiGrid },
  { id: 'orgaos', label: 'Órgãos', icon: MdOutlineBusiness },
  { id: 'usuarios', label: 'Usuários', icon: FiUsers },
]

const TEMP_PASSWORD = 'Sc#2026xT9k'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityColor(p: string): string {
  return ({ critica: 'red', alta: 'orange', media: 'yellow', baixa: 'blue' } as Record<string, string>)[p] ?? 'gray'
}

function priorityLabel(p: string): string {
  return ({ critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' } as Record<string, string>)[p] ?? p
}

function perfilColor(p: string): string {
  return ({ admin: 'red', manager: 'orange', citizen: 'blue' } as Record<string, string>)[p] ?? 'gray'
}

function perfilLabel(p: string): string {
  return ({ admin: 'Admin', manager: 'Gestor', citizen: 'Cidadão' } as Record<string, string>)[p] ?? p
}

function tipoLabel(t: string): string {
  return ({ municipal: 'Municipal', estadual: 'Estadual', concessionaria: 'Concessionária' } as Record<string, string>)[t] ?? t
}

function formatDate(d: string): string {
  if (!d || !d.includes('-')) return d
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function emptyMatrizForm(): MatrizForm {
  return { categoria: '', subcategoria: '', orgaoPrincipal: '', orgaoSecundario: '', sla: '', prioridade: '' }
}

function emptyOrgForm(): OrgForm {
  return { nome: '', sigla: '', tipo: '', responsavel: '', email: '', sla: '' }
}

function emptyUserForm(): UserForm {
  return { nome: '', email: '', perfil: '', orgao: '', setor: '' }
}

// ─── MatrizTab ────────────────────────────────────────────────────────────────

function MatrizTab() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rules, setRules] = useState<MatrizRule[]>(MATRIX_RULES_INITIAL)
  const [filterOrg, setFilterOrg] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [form, setForm] = useState<MatrizForm>(emptyMatrizForm())

  function handleModalClose() {
    setForm(emptyMatrizForm())
    onClose()
  }

  const filteredRules = useMemo(
    () =>
      rules.filter((r) => {
        const orgMatch = !filterOrg || r.orgaoPrincipal === filterOrg || r.orgaoSecundario === filterOrg
        const catMatch = !filterCat || r.categoria === filterCat
        return orgMatch && catMatch
      }),
    [rules, filterOrg, filterCat],
  )

  function handleSave() {
    handleModalClose()
  }

  function handleOpen() {
    setForm(emptyMatrizForm())
    onOpen()
  }

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        mb={6}
      >
        <Box>
          <Heading size="lg" color="gray.800">Matriz de Competências</Heading>
          <Text color="gray.500" mt={1} fontSize="sm">Define o roteamento automático de chamados</Text>
        </Box>
        <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={handleOpen} size="sm">
          Adicionar Regra
        </Button>
      </Flex>

      {/* Filters */}
      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Select
          placeholder="Todos os órgãos"
          value={filterOrg}
          onChange={(e) => setFilterOrg(e.target.value)}
          maxW="220px"
          size="sm"
        >
          {ORGS_INITIAL.map((o) => (
            <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>
          ))}
        </Select>
        <Select
          placeholder="Todas categorias"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          maxW="220px"
          size="sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
          ))}
        </Select>
      </HStack>

      {/* Table */}
      <Box
        boxShadow="sm"
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
        mb={6}
      >
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Categoria</Th>
                <Th>Subcategoria</Th>
                <Th>Órgão Principal</Th>
                <Th>Órgão Secundário</Th>
                <Th>SLA</Th>
                <Th>Prioridade</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRules.map((rule) => (
                <Tr key={rule.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <HStack spacing={1}>
                      <Text>{CATEGORY_ICONS[rule.categoria] ?? '📌'}</Text>
                      <Text fontWeight="medium" fontSize="sm">{rule.categoria}</Text>
                    </HStack>
                  </Td>
                  <Td fontSize="sm">{rule.subcategoria}</Td>
                  <Td>
                    <Badge colorScheme="blue">{rule.orgaoPrincipal}</Badge>
                  </Td>
                  <Td>
                    {rule.orgaoSecundario ? (
                      <Badge colorScheme="gray">{rule.orgaoSecundario}</Badge>
                    ) : (
                      <Text color="gray.400" fontSize="sm">—</Text>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="semibold">{rule.sla}h</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={priorityColor(rule.prioridade)}>
                      {priorityLabel(rule.prioridade)}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        icon={<Icon as={FiEdit2} boxSize={3.5} />}
                        aria-label="Editar regra"
                        size="xs"
                        variant="ghost"
                        colorScheme="blue"
                      />
                      <IconButton
                        icon={<Icon as={FiTrash2} boxSize={3.5} />}
                        aria-label="Deletar regra"
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => setRules((prev) => prev.filter((r) => r.id !== rule.id))}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {filteredRules.length === 0 && (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8} color="gray.400" fontSize="sm">
                    Nenhuma regra encontrada
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Routing Flow Card */}
      <Box border="1px" borderColor="blue.200" borderRadius="lg" bg="blue.50" p={4}>
        <Text fontWeight="semibold" color="blue.800" mb={3} fontSize="sm">
          Fluxo de Roteamento
        </Text>
        <Flex align="center" flexWrap="wrap" gap={2}>
          {[
            'Cidadão abre chamado',
            'Categoria + Subcategoria',
            'Matriz define órgão + SLA',
            'Roteado automaticamente',
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full" fontSize="xs">
                {step}
              </Badge>
              {i < arr.length - 1 && (
                <Text color="blue.500" fontWeight="bold" fontSize="sm">→</Text>
              )}
            </React.Fragment>
          ))}
        </Flex>
      </Box>

      {/* Add Rule Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar Regra</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Categoria</FormLabel>
                <Select
                  placeholder="Selecione..."
                  size="sm"
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Subcategoria</FormLabel>
                <Input
                  size="sm"
                  placeholder="Ex: Via local / municipal"
                  value={form.subcategoria}
                  onChange={(e) => setForm((f) => ({ ...f, subcategoria: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Órgão Principal</FormLabel>
                <Select
                  placeholder="Selecione..."
                  size="sm"
                  value={form.orgaoPrincipal}
                  onChange={(e) => setForm((f) => ({ ...f, orgaoPrincipal: e.target.value }))}
                >
                  {ORGS_INITIAL.map((o) => (
                    <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Órgão Secundário</FormLabel>
                <Select
                  size="sm"
                  value={form.orgaoSecundario}
                  onChange={(e) => setForm((f) => ({ ...f, orgaoSecundario: e.target.value }))}
                >
                  <option value="">Nenhum</option>
                  {ORGS_INITIAL.map((o) => (
                    <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">SLA padrão (horas)</FormLabel>
                <Input
                  type="number"
                  size="sm"
                  placeholder="Ex: 48"
                  value={form.sla}
                  onChange={(e) => setForm((f) => ({ ...f, sla: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Prioridade</FormLabel>
                <Select
                  placeholder="Selecione..."
                  size="sm"
                  value={form.prioridade}
                  onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value }))}
                >
                  <option value="critica">Crítica</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleModalClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave}>Salvar Regra</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// ─── OrgaosTab ────────────────────────────────────────────────────────────────

function OrgaosTab() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [orgs, setOrgs] = useState<Org[]>(ORGS_INITIAL)
  const [form, setForm] = useState<OrgForm>(emptyOrgForm())
  const [selectedCats, setSelectedCats] = useState<string[]>([])

  function handleOpen() {
    setForm(emptyOrgForm())
    setSelectedCats([])
    onOpen()
  }

  function handleSave() {
    if (!form.nome || !form.sigla) return
    setOrgs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sigla: form.sigla,
        nome: form.nome,
        tipo: form.tipo || 'municipal',
        responsavel: form.responsavel,
        email: form.email,
        sla: Number(form.sla) || 48,
        status: 'ativo',
        categorias: selectedCats,
      },
    ])
    onClose()
  }

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        mb={6}
      >
        <Box>
          <Heading size="lg" color="gray.800">Gestão de Órgãos</Heading>
          <Text color="gray.500" mt={1} fontSize="sm">Cadastre e gerencie os órgãos responsáveis</Text>
        </Box>
        <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={handleOpen} size="sm">
          Novo Órgão
        </Button>
      </Flex>

      {/* Cards Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {orgs.map((org) => (
          <Card
            key={org.id}
            border="1px"
            borderColor="gray.200"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <CardBody>
              {/* Card Header */}
              <Flex justify="space-between" mb={3}>
                <HStack spacing={3} align="flex-start">
                  <Box
                    bg="blue.500"
                    color="white"
                    borderRadius="lg"
                    p={2}
                    flexShrink={0}
                  >
                    <Icon as={MdOutlineBusiness} boxSize={5} />
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="sm" lineHeight={1.3}>{org.nome}</Text>
                    <Text fontSize="xs" color="gray.500" mt={0.5}>
                      {org.sigla} · {tipoLabel(org.tipo)} · SLA: {org.sla}h
                    </Text>
                  </Box>
                </HStack>
                <HStack spacing={0} flexShrink={0}>
                  <IconButton
                    icon={<Icon as={FiEdit2} boxSize={3.5} />}
                    aria-label="Editar órgão"
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                  />
                  <IconButton
                    icon={<Icon as={FiTrash2} boxSize={3.5} />}
                    aria-label="Excluir órgão"
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                  />
                </HStack>
              </Flex>

              {/* Responsável + Email */}
              <VStack align="start" spacing={0.5} mb={3}>
                <HStack spacing={1.5} color="gray.600">
                  <Icon as={FiUser} boxSize={3.5} />
                  <Text fontSize="xs">{org.responsavel}</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">{org.email}</Text>
              </VStack>

              {/* Status */}
              <Box mb={3}>
                <Badge colorScheme={org.status === 'ativo' ? 'green' : 'red'}>
                  {org.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
              </Box>

              {/* Categoria Tags */}
              <Wrap spacing={1}>
                {org.categorias.map((cat) => (
                  <WrapItem key={cat}>
                    <Badge variant="outline" colorScheme="blue" fontSize="10px" px={2} py={0.5}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Add Org Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Órgão</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Nome</FormLabel>
                <Input
                  size="sm"
                  placeholder="Ex: Prefeitura Municipal do Recife"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Sigla</FormLabel>
                <Input
                  size="sm"
                  placeholder="Ex: PMR"
                  value={form.sigla}
                  onChange={(e) => setForm((f) => ({ ...f, sigla: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Tipo</FormLabel>
                <Select
                  size="sm"
                  placeholder="Selecione..."
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                >
                  <option value="municipal">Municipal</option>
                  <option value="estadual">Estadual</option>
                  <option value="concessionaria">Concessionária</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Responsável</FormLabel>
                <Input
                  size="sm"
                  placeholder="Nome do responsável"
                  value={form.responsavel}
                  onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">E-mail</FormLabel>
                <Input
                  size="sm"
                  type="email"
                  placeholder="email@orgao.gov.br"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">SLA padrão (horas)</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  placeholder="48"
                  value={form.sla}
                  onChange={(e) => setForm((f) => ({ ...f, sla: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Categorias de competência</FormLabel>
                <CheckboxGroup
                  value={selectedCats}
                  onChange={(vals) => setSelectedCats(vals as string[])}
                >
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {CATEGORIES.map((cat) => (
                      <Checkbox
                        key={cat}
                        value={cat}
                        size="sm"
                        colorScheme="blue"
                        sx={{
                          '.chakra-checkbox__control': {
                            position: 'absolute',
                            opacity: 0,
                            pointerEvents: 'none',
                          },
                          '.chakra-checkbox__label': {
                            marginInlineStart: 0,
                            px: 3,
                            py: 1.5,
                            borderRadius: 'full',
                            borderWidth: '1px',
                            borderColor: 'gray.200',
                            bg: 'gray.50',
                            fontSize: 'sm',
                            transition: 'all 0.2s',
                          },
                          '.chakra-checkbox__input:checked + .chakra-checkbox__control + .chakra-checkbox__label': {
                            bg: 'blue.500',
                            borderColor: 'blue.500',
                            color: 'white',
                          },
                        }}
                      >
                        {CATEGORY_ICONS[cat]} {cat}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave}>Salvar Órgão</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// ─── UsuariosTab ──────────────────────────────────────────────────────────────

function UsuariosTab() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [users, setUsers] = useState<User[]>(MOCK_USERS_INITIAL)
  const [form, setForm] = useState<UserForm>(emptyUserForm())
  const [filterPerfil, setFilterPerfil] = useState('')
  const [filterOrgao, setFilterOrgao] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          !search ||
          u.nome.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        const matchPerfil = !filterPerfil || u.perfil === filterPerfil
        const matchOrgao = !filterOrgao || u.orgao === filterOrgao
        const matchStatus = !filterStatus || u.status === filterStatus
        return matchSearch && matchPerfil && matchOrgao && matchStatus
      }),
    [users, search, filterPerfil, filterOrgao, filterStatus],
  )

  function handleOpen() {
    setForm(emptyUserForm())
    onOpen()
  }

  function handleSave() {
    if (!form.nome || !form.email || !form.perfil) return
    setUsers((prev) => [
      ...prev,
      {
        id: Date.now(),
        nome: form.nome,
        email: form.email,
        perfil: form.perfil,
        orgao: form.perfil === 'manager' ? form.orgao || null : null,
        status: 'ativo',
        cadastro: new Date().toISOString().split('T')[0],
      },
    ])
    onClose()
  }

  function toggleStatus(id: number) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' } : u,
      ),
    )
  }

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={3}
        mb={6}
      >
        <Box>
          <Heading size="lg" color="gray.800">Gestão de Usuários</Heading>
          <Text color="gray.500" mt={1} fontSize="sm">
            Gerencie contas de cidadãos, gestores e administradores
          </Text>
        </Box>
        <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={handleOpen} size="sm">
          Novo Usuário
        </Button>
      </Flex>

      {/* Filters */}
      <Flex mb={4} flexWrap="wrap" gap={3} align="center">
        <Select
          placeholder="Todos perfis"
          value={filterPerfil}
          onChange={(e) => setFilterPerfil(e.target.value)}
          maxW="170px"
          size="sm"
        >
          <option value="citizen">Cidadão</option>
          <option value="manager">Gestor</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          placeholder="Todos órgãos"
          value={filterOrgao}
          onChange={(e) => setFilterOrgao(e.target.value)}
          maxW="170px"
          size="sm"
        >
          {ORGS_INITIAL.map((o) => (
            <option key={o.id} value={o.sigla}>{o.sigla}</option>
          ))}
        </Select>
        <Select
          placeholder="Todos status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          maxW="170px"
          size="sm"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
        <InputGroup size="sm" maxW="280px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" boxSize={3} />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </Flex>

      {/* Table */}
      <Box
        boxShadow="sm"
        borderRadius="lg"
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Perfil</Th>
                <Th>Órgão</Th>
                <Th>Status</Th>
                <Th>Cadastro</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((u) => (
                <Tr key={u.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium" fontSize="sm">{u.nome}</Td>
                  <Td fontSize="xs" color="gray.600">{u.email}</Td>
                  <Td>
                    <Badge colorScheme={perfilColor(u.perfil)}>{perfilLabel(u.perfil)}</Badge>
                  </Td>
                  <Td>
                    {u.orgao ? (
                      <Badge colorScheme="purple">{u.orgao}</Badge>
                    ) : (
                      <Text color="gray.400" fontSize="sm">—</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={u.status === 'ativo' ? 'green' : 'gray'}>
                      {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td fontSize="xs" color="gray.600">{formatDate(u.cadastro)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" variant="outline" colorScheme="blue">
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        colorScheme={u.status === 'ativo' ? 'red' : 'green'}
                        onClick={() => toggleStatus(u.id)}
                      >
                        {u.status === 'ativo' ? 'Desativar' : 'Reativar'}
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {filteredUsers.length === 0 && (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8} color="gray.400" fontSize="sm">
                    Nenhum usuário encontrado
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Text fontSize="xs" color="gray.500" mt={2} textAlign="right">
        Exibindo {filteredUsers.length} de {users.length} usuário(s)
      </Text>

      {/* Add User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Novo Usuário</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Nome completo</FormLabel>
                <Input
                  size="sm"
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">E-mail</FormLabel>
                <Input
                  size="sm"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Perfil</FormLabel>
                <Select
                  size="sm"
                  placeholder="Selecione..."
                  value={form.perfil}
                  onChange={(e) => setForm((f) => ({ ...f, perfil: e.target.value, orgao: '' }))}
                >
                  <option value="citizen">Cidadão</option>
                  <option value="manager">Gestor</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
              {form.perfil === 'manager' && (
                <FormControl>
                  <FormLabel fontSize="sm">Órgão</FormLabel>
                  <Select
                    size="sm"
                    placeholder="Selecione o órgão..."
                    value={form.orgao}
                    onChange={(e) => setForm((f) => ({ ...f, orgao: e.target.value }))}
                  >
                    {ORGS_INITIAL.map((o) => (
                      <option key={o.id} value={o.sigla}>{o.sigla} — {o.nome}</option>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl>
                <FormLabel fontSize="sm">Setor de atuação</FormLabel>
                <Input
                  size="sm"
                  placeholder="Ex: Obras e Infraestrutura"
                  value={form.setor}
                  onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value }))}
                />
              </FormControl>
              <Box
                bg="blue.50"
                border="1px"
                borderColor="blue.200"
                borderRadius="md"
                p={3}
              >
                <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={1}>
                  Senha temporária gerada:
                </Text>
                <Text fontFamily="monospace" fontSize="md" color="blue.700" letterSpacing="wider">
                  {TEMP_PASSWORD}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSave}>Criar Usuário</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('matriz')

  return (
    <Flex h="100vh" bg="gray.50" overflow="hidden">
      {/* ── Sidebar (Desktop) ── */}
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        direction="column"
        w="256px"
        h="100vh"
        bg="#1a1f2e"
        color="white"
        position="fixed"
        top={0}
        left={0}
        zIndex={20}
      >
        {/* Logo */}
        <Box px={5} py={5} borderBottom="1px" borderColor="whiteAlpha.200">
          <HStack spacing={3}>
            <Box
              bg="blue.500"
              borderRadius="lg"
              p={2}
              flexShrink={0}
            >
              <Icon as={FiSettings} boxSize={5} />
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="md" lineHeight={1.2} color="white">
                Smart City
              </Text>
              <Text fontSize="xs" color="gray.400" mt={0.5}>
                Administração
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Nav Items */}
        <VStack spacing={1} p={3} flex={1} align="stretch">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id
            return (
              <Box
                key={item.id}
                as="button"
                onClick={() => setActiveTab(item.id)}
                textAlign="left"
                px={3}
                py={2.5}
                borderRadius="lg"
                bg={active ? 'whiteAlpha.200' : 'transparent'}
                color={active ? 'blue.400' : 'gray.400'}
                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                transition="all 0.15s"
                w="full"
              >
                <HStack spacing={3}>
                  <Icon as={item.icon} boxSize={4.5} />
                  <Text fontSize="sm" fontWeight={active ? 'semibold' : 'normal'}>
                    {item.label}
                  </Text>
                </HStack>
              </Box>
            )
          })}
        </VStack>

        {/* Logout */}
        <Box p={3} borderTop="1px" borderColor="whiteAlpha.200">
          <Box
            as="button"
            w="full"
            textAlign="left"
            px={3}
            py={2.5}
            borderRadius="lg"
            color="gray.400"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            transition="all 0.15s"
          >
            <HStack spacing={3}>
              <Icon as={FiLogOut} boxSize={4.5} />
              <Text fontSize="sm">Sair</Text>
            </HStack>
          </Box>
        </Box>
      </Flex>

      <Flex
        flex={1}
        direction="column"
        ml={{ base: 0, lg: '256px' }}
        minW={0}
        h="100vh"
      >
        {/* ── Mobile Top Nav ── */}
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="sticky"
          top={0}
          zIndex={20}
          bg="#1a1f2e"
          w="full"
          boxShadow="md"
          flexShrink={0}
        >
          <HStack spacing={0}>
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id
              return (
                <Box
                  key={item.id}
                  as="button"
                  onClick={() => setActiveTab(item.id)}
                  flex={1}
                  py={3}
                  px={1}
                  textAlign="center"
                  bg={active ? 'whiteAlpha.200' : 'transparent'}
                  color={active ? 'blue.400' : 'gray.400'}
                  _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  transition="all 0.15s"
                  borderBottom="2px solid"
                  borderColor={active ? 'blue.400' : 'transparent'}
                >
                  <VStack spacing={0.5}>
                    <Icon as={item.icon} boxSize={4.5} />
                    <Text fontSize="10px" fontWeight={active ? 'semibold' : 'normal'}>
                      {item.label}
                    </Text>
                  </VStack>
                </Box>
              )
            })}
          </HStack>
        </Box>

        {/* ── Main Content ── */}
        <Box
          flex={1}
          h="100vh"
          overflowY="auto"
          p={{ base: 4, lg: 6 }}
          bg="white"
        >
          {activeTab === 'matriz' && <MatrizTab />}
          {activeTab === 'orgaos' && <OrgaosTab />}
          {activeTab === 'usuarios' && <UsuariosTab />}
        </Box>
      </Flex>
    </Flex>
  )
}
