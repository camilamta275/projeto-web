'use client'

import React from 'react'
import {
  Badge,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'

interface OrgaoMock {
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

interface Rule {
  id: number
  categoria: string
  subcategoria: string
  orgaoPrincipal: string
  orgaoSecundario: string | null
  sla: number
  prioridade: string
}

const ORGS: OrgaoMock[] = [
  {
    id: 'pmr',
    sigla: 'PMR',
    nome: 'Prefeitura Municipal do Recife',
    tipo: 'municipal',
    responsavel: 'João Silva',
    email: 'joao@prefeitura.gov.br',
    sla: 72,
    status: 'ativo',
    categorias: ['Problemas na Via', 'Iluminação Pública', 'Saneamento Básico', 'Sinalização'],
  },
  {
    id: 'gope',
    sigla: 'GOPE',
    nome: 'Governo do Estado de Pernambuco',
    tipo: 'estadual',
    responsavel: 'Maria Lima',
    email: 'maria@pe.gov.br',
    sla: 120,
    status: 'ativo',
    categorias: ['Problemas na Via'],
  },
  {
    id: 'compesa',
    sigla: 'COMPESA',
    nome: 'Compesa',
    tipo: 'concessionaria',
    responsavel: 'Carlos Santos',
    email: 'carlos@compesa.com.br',
    sla: 48,
    status: 'ativo',
    categorias: ['Água e Esgoto', 'Saneamento Básico'],
  },
  {
    id: 'enrg',
    sigla: 'ENRG',
    nome: 'Energisa Pernambuco',
    tipo: 'concessionaria',
    responsavel: 'Ana Costa',
    email: 'ana@energisa.com.br',
    sla: 24,
    status: 'ativo',
    categorias: ['Iluminação Pública'],
  },
  {
    id: 'detran',
    sigla: 'DETRAN',
    nome: 'DETRAN-PE',
    tipo: 'estadual',
    responsavel: 'Pedro Alves',
    email: 'pedro@detran.pe.gov.br',
    sla: 96,
    status: 'ativo',
    categorias: ['Sinalização'],
  },
]

const CATEGORIES = [
  'Problemas na Via',
  'Água e Esgoto',
  'Iluminação Pública',
  'Saneamento Básico',
  'Sinalização',
  'Outros Problemas',
]

const CATEGORY_ICONS: Record<string, string> = {
  'Problemas na Via': '🏗️',
  'Água e Esgoto': '💧',
  'Iluminação Pública': '💡',
  'Saneamento Básico': '🗑️',
  'Sinalização': '🚦',
  'Outros Problemas': '📌',
}

const INITIAL_RULES: Rule[] = [
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

const priorityMap: Record<string, { label: string; colorScheme: string }> = {
  critica: { label: 'Crítica', colorScheme: 'red' },
  alta: { label: 'Alta', colorScheme: 'orange' },
  media: { label: 'Média', colorScheme: 'yellow' },
  baixa: { label: 'Baixa', colorScheme: 'blue' },
}

function emptyForm() {
  return {
    categoria: '',
    subcategoria: '',
    orgaoPrincipal: '',
    orgaoSecundario: '',
    sla: '48',
    prioridade: 'media',
  }
}

export default function MatrizPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rules, setRules] = React.useState<Rule[]>(INITIAL_RULES)
  const [filterOrg, setFilterOrg] = React.useState('')
  const [filterCat, setFilterCat] = React.useState('')
  const [editingRule, setEditingRule] = React.useState<Rule | null>(null)
  const [form, setForm] = React.useState(emptyForm())

  const filteredRules = React.useMemo(
    () =>
      rules.filter(
        (rule) =>
          (!filterOrg || rule.orgaoPrincipal === filterOrg || rule.orgaoSecundario === filterOrg) &&
          (!filterCat || rule.categoria === filterCat)
      ),
    [rules, filterOrg, filterCat]
  )

  const abrirModalNovaRegra = () => {
    setEditingRule(null)
    setForm(emptyForm())
    onOpen()
  }

  const editarRegra = (rule: Rule) => {
    setEditingRule(rule)
    setForm({
      categoria: rule.categoria,
      subcategoria: rule.subcategoria,
      orgaoPrincipal: rule.orgaoPrincipal,
      orgaoSecundario: rule.orgaoSecundario || '',
      sla: String(rule.sla),
      prioridade: rule.prioridade,
    })
    onOpen()
  }

  const fecharModal = () => {
    setEditingRule(null)
    setForm(emptyForm())
    onClose()
  }

  const salvarRegra = () => {
    if (!form.categoria || !form.subcategoria || !form.orgaoPrincipal) {
      toast({
        title: 'Preencha categoria, subcategoria e órgão principal.',
        status: 'warning',
      })
      return
    }

    toast({
      title: editingRule ? 'Edição simulada.' : 'Cadastro simulado.',
      description: 'Como esta tela está em mock, o botão apenas fecha o modal sem persistir alterações.',
      status: 'info',
      duration: 4000,
    })

    fecharModal()
  }

  const excluirRegra = (id: number) => {
    setRules((current) => current.filter((rule) => rule.id !== id))
    toast({ title: 'Regra removida.', status: 'success' })
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <VStack spacing={6} align="stretch">
          <HStack
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            flexDir={{ base: 'column', md: 'row' }}
            spacing={4}
          >
            <Box>
              <Heading size="lg" color="gray.800">
                Matriz de Competências
              </Heading>
              <Text color="gray.600" mt={1}>
                Define o roteamento automático de chamados por categoria, subcategoria, órgão, SLA e prioridade.
              </Text>
            </Box>
            <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={abrirModalNovaRegra}>
              Adicionar Regra
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" color="gray.700">
                Filtrar por Órgão
              </FormLabel>
              <Select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} bg="white">
                <option value="">Todos os órgãos</option>
                {ORGS.map((org) => (
                  <option key={org.id} value={org.sigla}>
                    {org.sigla}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color="gray.700">
                Filtrar por Categoria
              </FormLabel>
              <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} bg="white">
                <option value="">Todas as categorias</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <Box className="glass-card" bg="whiteAlpha.900" borderWidth="1px" borderColor="gray.200" overflow="hidden">
            <Box px={{ base: 4, md: 6 }} pb={2}>
              <Text fontSize="sm" color="gray.600">
                {filteredRules.length} regra(s) encontrada(s) na matriz.
              </Text>
            </Box>

            <Box overflowX="auto">
              <Box minW="800px">
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Categoria</Th>
                      <Th>Subcategoria</Th>
                      <Th>Órgão Principal</Th>
                      <Th>Órgão Secundário</Th>
                      <Th>SLA (horas)</Th>
                      <Th>Prioridade</Th>
                      <Th textAlign="right">Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRules.map((rule) => {
                      const priority = priorityMap[rule.prioridade] || priorityMap.media

                      return (
                        <Tr key={rule.id}>
                          <Td>
                            <HStack spacing={2} fontWeight="semibold" color="gray.800">
                              <Text>{CATEGORY_ICONS[rule.categoria] || '📌'}</Text>
                              <Text>{rule.categoria}</Text>
                            </HStack>
                          </Td>
                          <Td color="gray.700">{rule.subcategoria}</Td>
                          <Td>
                            <Text color="blue.600" fontWeight="bold">
                              {rule.orgaoPrincipal}
                            </Text>
                          </Td>
                          <Td color={rule.orgaoSecundario ? 'gray.600' : 'gray.400'}>
                            {rule.orgaoSecundario || '—'}
                          </Td>
                          <Td color="gray.700">{rule.sla}h</Td>
                          <Td>
                            <Badge colorScheme={priority.colorScheme} variant="subtle" borderRadius="full" px={2.5} py={1}>
                              {priority.label}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack justify="flex-end" spacing={2}>
                              <IconButton
                                aria-label="Editar regra"
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => editarRegra(rule)}
                              />
                              <IconButton
                                aria-label="Excluir regra"
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => excluirRegra(rule.id)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Box>

          <Box bg="blue.50" borderWidth="1px" borderColor="blue.100" borderRadius="2xl" px={{ base: 4, md: 6 }} py={5}>
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
                  <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3} py={1.5} whiteSpace="normal">
                    {step}
                  </Badge>
                  {index < array.length - 1 ? (
                    <Text color="blue.300" fontWeight="bold">
                      →
                    </Text>
                  ) : null}
                </React.Fragment>
              ))}
            </HStack>
          </Box>
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={fecharModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingRule ? 'Editar Regra' : 'Adicionar Regra'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Categoria</FormLabel>
                <Select
                  placeholder="Selecione..."
                  value={form.categoria}
                  onChange={(e) => setForm((current) => ({ ...current, categoria: e.target.value }))}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Subcategoria</FormLabel>
                <Input
                  value={form.subcategoria}
                  onChange={(e) => setForm((current) => ({ ...current, subcategoria: e.target.value }))}
                  placeholder="Ex: Buraco na pista"
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Órgão Principal</FormLabel>
                  <Select
                    placeholder="Selecione..."
                    value={form.orgaoPrincipal}
                    onChange={(e) => setForm((current) => ({ ...current, orgaoPrincipal: e.target.value }))}
                  >
                    {ORGS.map((org) => (
                      <option key={org.id} value={org.sigla}>
                        {org.sigla} — {org.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Órgão Secundário</FormLabel>
                  <Select
                    value={form.orgaoSecundario}
                    onChange={(e) => setForm((current) => ({ ...current, orgaoSecundario: e.target.value }))}
                  >
                    <option value="">Nenhum</option>
                    {ORGS.map((org) => (
                      <option key={org.id} value={org.sigla}>
                        {org.sigla} — {org.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>SLA padrão (horas)</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={form.sla}
                    onChange={(e) => setForm((current) => ({ ...current, sla: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Prioridade padrão</FormLabel>
                  <Select
                    value={form.prioridade}
                    onChange={(e) => setForm((current) => ({ ...current, prioridade: e.target.value }))}
                  >
                    <option value="critica">Crítica</option>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <Text fontSize="sm" color="gray.500">
                Esta ação é mock. O botão Salvar Regra apenas fecha o modal e mantém a tabela como referência estática.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={fecharModal}>
                Fechar
              </Button>
              <Button colorScheme="blue" onClick={salvarRegra}>
                Salvar Regra
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}