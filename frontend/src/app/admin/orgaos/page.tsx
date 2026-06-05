'use client'

import React from 'react'
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  Select,
  useToast,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { api } from '@/lib/api'

interface Orgao {
  id: string
  sigla: string
  nome: string
  tipo: string
  slaDefault: number
  responsavel: string
  email: string
  status: 'ativo' | 'inativo'
  telefone?: string
  categorias: string[] // backend retorna nomes
}

interface Categoria {
  id: number
  nome: string
  descricao: string | null
}

// FormData usa ids numéricos para as categorias (para enviar ao backend)
interface OrgaoFormData {
  sigla: string
  nome: string
  tipo: string
  slaDefault: number | ''
  responsavel: string
  email: string
  telefone: string
  categorias: number[]
}

const FORM_INICIAL: OrgaoFormData = {
  sigla: '',
  nome: '',
  tipo: '',
  slaDefault: '',
  responsavel: '',
  email: '',
  telefone: '',
  categorias: [],
}

export default function OrgaosPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [orgaos, setOrgaos] = React.useState<Orgao[]>([])
  const [categorias, setCategorias] = React.useState<Categoria[]>([])
  const [loading, setLoading] = React.useState(true)
  const [salvando, setSalvando] = React.useState(false)

  const [editando, setEditando] = React.useState<Orgao | null>(null)
  const [formData, setFormData] = React.useState<OrgaoFormData>(FORM_INICIAL)

  // Carrega categorias
  React.useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategorias(data))
      .catch(() => { })
  }, [])

  // Carrega órgãos
  const carregarOrgaos = () => {
    setLoading(true)
    api.get('/admin/organs')
      .then(({ data }) => setOrgaos(data))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  React.useEffect(() => {
    carregarOrgaos()
  }, [])

  const handleAdicionarOrgao = () => {
    setEditando(null)
    setFormData(FORM_INICIAL)
    onOpen()
  }

  const handleEditarOrgao = (orgao: Orgao) => {
    setEditando(orgao)

    // Backend retorna categorias como string[] de nomes → converte para id[]
    // para que as tags apareçam selecionadas corretamente no modal
    const categoriaIds = categorias
      .filter(c => orgao.categorias.includes(c.nome))
      .map(c => c.id)

    setFormData({
      sigla: orgao.sigla,
      nome: orgao.nome,
      tipo: orgao.tipo,
      slaDefault: orgao.slaDefault,
      responsavel: orgao.responsavel,
      email: orgao.email,
      telefone: orgao.telefone ?? '',
      categorias: categoriaIds,
    })

    onOpen()
  }

  const handleSalvar = async () => {
    if (
      !formData.nome ||
      !formData.email ||
      !formData.slaDefault ||
      !formData.responsavel ||
      !formData.categorias.length
    ) {
      toast({ title: 'Preencha todos os campos obrigatórios', status: 'warning' })
      return
    }

    // Campos obrigatórios apenas no cadastro
    if (!editando && !formData.sigla) {
      toast({ title: 'Informe a sigla do órgão', status: 'warning' })
      return
    }

    setSalvando(true)
    try {
      if (editando) {
        const payload = {
          nome: formData.nome,
          tipo: formData.tipo,
          slahoras: formData.slaDefault,
          responsavel: formData.responsavel,
          email: formData.email,
          telefone: formData.telefone || undefined,
          categorias: formData.categorias,
        }

        await api.put(`/admin/organs/${editando.id}`, payload)
        toast({ title: 'Órgão atualizado', status: 'success' })
      } else {
        await api.post('/admin/organs', {
          id: formData.sigla,
          sigla: formData.sigla,
          nome: formData.nome,
          tipo: formData.tipo,
          slahoras: formData.slaDefault,
          responsavel: formData.responsavel,
          email: formData.email,
          telefone: formData.telefone || undefined,
          categorias: formData.categorias,
        })
        toast({ title: 'Órgão adicionado', status: 'success' })
      }

      onClose()
      carregarOrgaos() // recarrega lista com dados atualizados
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar órgão',
        description: error?.response?.data?.message || error.message || 'Não foi possível concluir a operação',
        status: 'error',
      })
    } finally {
      setSalvando(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    const orgao = orgaos.find(o => o.id === id)
    if (!orgao) return

    const novoStatus = orgao.status === 'ativo' ? 'inativo' : 'ativo'

    try {
      await api.put(`/admin/organs/${id}/${novoStatus}`)

      // Atualiza localmente sem precisar recarregar tudo
      setOrgaos(orgaos.map(o =>
        o.id === id ? { ...o, status: novoStatus } : o
      ))

      toast({
        title: `Órgão ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`,
        status: 'success',
      })
    } catch {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível concluir a operação',
        status: 'error',
      })
    }
  }

  const toggleCategoria = (id: number) => {
    setFormData(prev => ({
      ...prev,
      categorias: prev.categorias.includes(id)
        ? prev.categorias.filter(c => c !== id)
        : [...prev.categorias, id],
    }))
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
              <Heading size="lg" color="gray.800">Órgãos</Heading>
              <Text color="gray.600" mt={1}>
                Gerencie os órgãos vinculados à operação do Recife Inteligente.
              </Text>
            </Box>
            <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={handleAdicionarOrgao}>
              Novo Órgão
            </Button>
          </HStack>

          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" boxShadow="sm" p={{ base: 4, md: 5 }}>
            {loading ? (
              <Center py={20}><Spinner size="xl" /></Center>
            ) : (
              <>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Total de {orgaos.length} órgão(s) cadastrados.
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {orgaos.map((orgao) => (
                    <Card
                      key={orgao.id}
                      bg="gray.50"
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="xl"
                      boxShadow="xs"
                      _hover={{ boxShadow: 'sm', transform: 'translateY(-1px)' }}
                      transition="all 0.2s"
                    >
                      <CardBody p={4}>
                        <VStack align="start" spacing={4} width="100%">
                          <HStack justify="space-between" width="100%" align="start">
                            <Box>
                              <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                                {orgao.sigla}
                              </Text>
                              <Heading size="sm" mt={1} color="gray.800">{orgao.nome}</Heading>
                              <Text fontSize="sm" color="gray.600" mt={1}>{orgao.tipo}</Text>
                            </Box>
                            <Badge colorScheme={orgao.status === 'ativo' ? 'green' : 'gray'} borderRadius="full" px={2.5} py={1}>
                              {orgao.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </HStack>

                          <VStack align="start" spacing={2} width="100%">
                            <Box>
                              <Text fontSize="xs" color="gray.500">Responsável</Text>
                              <Text fontSize="sm" color="gray.700">{orgao.responsavel}</Text>
                            </Box>
                            <Box>
                              <Text fontSize="xs" color="gray.500">Email</Text>
                              <Text fontSize="sm" color="blue.700">{orgao.email}</Text>
                            </Box>
                            <HStack spacing={2} flexWrap="wrap">
                              <Badge colorScheme="blue" variant="subtle">SLA {orgao.slaDefault}h</Badge>
                              <Badge colorScheme="purple" variant="subtle">{orgao.tipo}</Badge>
                            </HStack>
                          </VStack>

                          <Box width="100%">
                            <Text fontSize="xs" color="gray.500" mb={2}>Categorias atendidas</Text>
                            <Wrap spacing={2}>
                              {orgao.categorias.map((categoria, index) => (
                                <Badge key={index} borderRadius="full" px={2.5} py={1} colorScheme="purple" variant="subtle">
                                  {categoria}
                                </Badge>
                              ))}
                            </Wrap>
                          </Box>

                          <HStack spacing={2} width="100%">
                            <Button size="sm" colorScheme="blue" variant="outline" flex={1} onClick={() => handleEditarOrgao(orgao)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              colorScheme={orgao.status === 'ativo' ? 'red' : 'green'}
                              variant="outline"
                              flex={1}
                              onClick={() => handleToggleStatus(orgao.id)}
                            >
                              {orgao.status === 'ativo' ? 'Desativar' : 'Ativar'}
                            </Button>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </>
            )}
          </Box>
        </VStack>
      </Container>

      {/* Modal Adicionar/Editar */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editando ? '✏️ Editar Órgão' : '➕ Novo Órgão'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Sigla *</Text>
                <Input
                  placeholder="Ex: PMR"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  isDisabled={!!editando}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Nome *</Text>
                <Input
                  placeholder="Ex: Prefeitura do Recife"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Tipo</Text>
                <Select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Selecione..."
                >
                  <option value="Municipal">Municipal</option>
                  <option value="Estadual">Estadual</option>
                  <option value="Federal">Federal</option>
                  <option value="Concessionária">Concessionária</option>
                </Select>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">SLA Padrão (horas) *</Text>
                <Input
                  type="number"
                  placeholder="24"
                  value={formData.slaDefault}
                  onChange={(e) => setFormData({ ...formData, slaDefault: parseInt(e.target.value) || '' })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Responsável *</Text>
                <Input
                  placeholder="Nome do responsável"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Email *</Text>
                <Input
                  type="email"
                  placeholder="contato@orgao.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Telefone</Text>
                <Input
                  placeholder="(81) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Categorias *</Text>
                <Wrap spacing={2}>
                  {categorias.map((categoria) => {
                    const selecionada = formData.categorias.includes(categoria.id)
                    return (
                      <WrapItem key={categoria.id}>
                        <Tag
                          size="lg"
                          cursor="pointer"
                          colorScheme={selecionada ? 'blue' : 'gray'}
                          onClick={() => toggleCategoria(categoria.id)}
                        >
                          <TagLabel>{categoria.nome}</TagLabel>
                        </Tag>
                      </WrapItem>
                    )
                  })}
                </Wrap>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onClose} isDisabled={salvando}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleSalvar} isLoading={salvando} loadingText="Salvando...">
                {editando ? 'Atualizar' : 'Adicionar'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}