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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
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
  IconButton,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, EditIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'cidadao' | 'gestor' | 'admin'
  orgao?: string
  setor?: string
  status: 'ativo' | 'inativo'
  dataCadastro: string
  senhaTemparia?: string
}

const usuariosInitial: Usuario[] = [
  {
    id: '1',
    nome: 'Maria Santos',
    email: 'maria@example.com',
    perfil: 'cidadao',
    status: 'ativo',
    dataCadastro: '2026-01-15',
  },
  {
    id: '2',
    nome: 'Pedro Silva',
    email: 'pedro@pmr.pe.gov.br',
    perfil: 'gestor',
    orgao: 'PMR',
    setor: 'Obras',
    status: 'ativo',
    dataCadastro: '2026-01-10',
  },
  {
    id: '3',
    nome: 'João Santos',
    email: 'joao@compesa.com.br',
    perfil: 'gestor',
    orgao: 'COMPESA',
    setor: 'Técnico',
    status: 'ativo',
    dataCadastro: '2026-02-01',
  },
  {
    id: '4',
    nome: 'Admin Recife',
    email: 'admin@recife.pe.gov.br',
    perfil: 'admin',
    status: 'ativo',
    dataCadastro: '2025-12-01',
  },
  {
    id: '5',
    nome: 'Carlos Oliveira',
    email: 'carlos@example.com',
    perfil: 'cidadao',
    status: 'inativo',
    dataCadastro: '2026-02-15',
  },
  {
    id: '6',
    nome: 'Lucia Silva',
    email: 'lucia@energisa.com.br',
    perfil: 'gestor',
    orgao: 'Energisa',
    setor: 'Atendimento',
    status: 'ativo',
    dataCadastro: '2026-02-20',
  },
]

const ORGAO_OPTIONS = ['PMR', 'COMPESA', 'Energisa', 'DETRAN-PE', 'GOPE']

const gerarSenhaTemporaria = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export default function UsuariosPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [usuarios, setUsuarios] = React.useState<Usuario[]>(usuariosInitial)
  const [editando, setEditando] = React.useState<Usuario | null>(null)
  const [formData, setFormData] = React.useState<Partial<Usuario>>({})
  const [filtroPerfil, setFiltroPerfil] = React.useState('todos')
  const [filtroOrgao, setFiltroOrgao] = React.useState('todos')
  const [filtroStatus, setFiltroStatus] = React.useState('todos')
  const [busca, setBusca] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)

  const handleAdicionarUsuario = () => {
    setEditando(null)
    setFormData({
      senhaTemparia: gerarSenhaTemporaria(),
    })
    onOpen()
  }

  const handleEditarUsuario = (usuario: Usuario) => {
    setEditando(usuario)
    setFormData(usuario)
    onOpen()
  }

  const handleSalvar = () => {
    if (!formData.nome || !formData.email || !formData.perfil) {
      toast({
        title: 'Preencha todos os campos obrigatórios',
        status: 'warning',
      })
      return
    }

    if (editando) {
      setUsuarios(usuarios.map((u) => (u.id === editando.id ? { ...editando, ...formData } : u)))
      toast({
        title: 'Usuário atualizado',
        status: 'success',
      })
    } else {
      const novoUsuario: Usuario = {
        id: Date.now().toString(),
        status: 'ativo',
        dataCadastro: new Date().toISOString().split('T')[0],
        ...formData,
      } as Usuario
      setUsuarios([...usuarios, novoUsuario])
      toast({
        title: 'Usuário adicionado',
        description: `Senha temporária: ${formData.senhaTemparia}`,
        status: 'success',
        duration: 5,
      })
    }

    onClose()
  }

  const handleToggleStatus = (id: string) => {
    setUsuarios(
      usuarios.map((u) => (u.id === id ? { ...u, status: u.status === 'ativo' ? 'inativo' : 'ativo' } : u))
    )
    toast({
      title: 'Status atualizado',
      status: 'success',
    })
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
    const matchPerfil = filtroPerfil === 'todos' || u.perfil === filtroPerfil
    const matchOrgao = filtroOrgao === 'todos' || u.orgao === filtroOrgao
    const matchStatus = filtroStatus === 'todos' || u.status === filtroStatus

    return matchBusca && matchPerfil && matchOrgao && matchStatus
  })

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
              <Heading size="lg" color="gray.800">Usuários</Heading>
              <Text color="gray.600" mt={1}>
                Gerencie permissões, status e vínculo dos usuários da plataforma.
              </Text>
            </Box>
            <Button colorScheme="blue" leftIcon={<AddIcon />} onClick={handleAdicionarUsuario}>
              + Novo Usuário
            </Button>
          </HStack>

          <Card bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" boxShadow="sm">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm" color="gray.700">Filtros</Heading>
                <HStack spacing={3} flexWrap={{ base: 'wrap', md: 'nowrap' }}>
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    size="sm"
                    maxW={{ base: '100%', md: '300px' }}
                  />

                  <Select
                    value={filtroPerfil}
                    onChange={(e) => setFiltroPerfil(e.target.value)}
                    size="sm"
                    maxW="150px"
                  >
                    <option value="todos">Todos os perfis</option>
                    <option value="cidadao">Cidadão</option>
                    <option value="gestor">Gestor</option>
                    <option value="admin">Admin</option>
                  </Select>

                  <Select
                    value={filtroOrgao}
                    onChange={(e) => setFiltroOrgao(e.target.value)}
                    size="sm"
                    maxW="150px"
                  >
                    <option value="todos">Todos órgãos</option>
                    {ORGAO_OPTIONS.map((orgao) => (
                      <option key={orgao} value={orgao}>
                        {orgao}
                      </option>
                    ))}
                  </Select>

                  <Select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    size="sm"
                    maxW="150px"
                  >
                    <option value="todos">Todos status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </Select>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" boxShadow="sm" overflow="hidden">
            <Box px={{ base: 4, md: 6 }} py={4} borderBottomWidth="1px" borderColor="gray.100" bg="gray.50">
              <Text fontSize="sm" color="gray.600">
                Exibindo {usuariosFiltrados.length} de {usuarios.length} usuário(s).
              </Text>
            </Box>

            <Box overflowX="auto" px={{ base: 2, md: 4 }} py={3}>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Nome</Th>
                    <Th>Email</Th>
                    <Th>Perfil</Th>
                    <Th>Órgão</Th>
                    <Th>Status</Th>
                    <Th>Cadastro</Th>
                    <Th textAlign="right">Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <Tr key={usuario.id}>
                      <Td fontWeight="bold">{usuario.nome}</Td>
                      <Td fontSize="sm" fontFamily="monospace">
                        {usuario.email}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            usuario.perfil === 'admin'
                              ? 'red'
                              : usuario.perfil === 'gestor'
                                ? 'blue'
                                : 'green'
                          }
                          variant="subtle"
                        >
                          {usuario.perfil === 'cidadao'
                            ? 'Cidadão'
                            : usuario.perfil === 'gestor'
                              ? 'Gestor'
                              : 'Admin'}
                        </Badge>
                      </Td>
                      <Td>
                        {usuario.orgao ? (
                          <Badge colorScheme="purple" variant="subtle">{usuario.orgao}</Badge>
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={usuario.status === 'ativo' ? 'green' : 'gray'} variant="subtle">
                          {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </Td>
                      <Td fontSize="xs" color="gray.600">
                        {usuario.dataCadastro}
                      </Td>
                      <Td>
                        <HStack justify="flex-end" spacing={1}>
                          <IconButton
                            icon={<EditIcon />}
                            aria-label="Editar"
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditarUsuario(usuario)}
                          />
                          <IconButton
                            icon={usuario.status === 'ativo' ? <DeleteIcon /> : <ViewIcon />}
                            aria-label={usuario.status === 'ativo' ? 'Desativar' : 'Ativar'}
                            size="sm"
                            colorScheme={usuario.status === 'ativo' ? 'red' : 'green'}
                            variant="ghost"
                            onClick={() => handleToggleStatus(usuario.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </VStack>
      </Container>

      {/* Modal Adicionar/Editar */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editando ? '✏️ Editar Usuário' : '➕ Novo Usuário'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Nome *</Text>
                <Input
                  placeholder="Nome completo"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Email *</Text>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Perfil *</Text>
                <Select
                  value={formData.perfil || ''}
                  onChange={(e) => {
                    const novoPerfil = e.target.value as Usuario['perfil']
                    setFormData((current) => ({
                      ...current,
                      perfil: novoPerfil,
                      orgao: novoPerfil === 'cidadao' ? undefined : current.orgao,
                      setor: novoPerfil === 'gestor' ? current.setor : undefined,
                    }))
                  }}
                  placeholder="Selecione..."
                >
                  <option value="cidadao">Cidadão</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Admin</option>
                </Select>
              </VStack>

              {formData.perfil && formData.perfil !== 'cidadao' && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Órgão</Text>
                  <Select
                    value={formData.orgao || ''}
                    onChange={(e) => setFormData({ ...formData, orgao: e.target.value || undefined })}
                    placeholder="Selecione..."
                  >
                    {ORGAO_OPTIONS.map((orgao) => (
                      <option key={orgao} value={orgao}>
                        {orgao}
                      </option>
                    ))}
                  </Select>
                </VStack>
              )}

              {formData.perfil === 'gestor' && (
                <>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Setor</Text>
                    <Input
                      placeholder="Ex: Obras, Técnico"
                      value={formData.setor || ''}
                      onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    />
                  </VStack>
                </>
              )}

              {!editando && (
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold">Senha Temporária</Text>
                  <InputGroup size="md">
                    <Input
                      pr="4.5rem"
                      type={mostrarSenha ? 'text' : 'password'}
                      value={formData.senhaTemparia || ''}
                      isReadOnly
                    />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        variant="ghost"
                      >
                        {mostrarSenha ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="xs" color="gray.600">
                    Senha gerada automaticamente. Usuário deverá alterar no primeiro acesso.
                  </Text>
                </VStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleSalvar}>
                {editando ? 'Atualizar' : 'Adicionar'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
