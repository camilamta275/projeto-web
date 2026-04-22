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
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

interface Orgao {
  id: string
  sigla: string
  nome: string
  tipo: string
  slaDefault: number
  responsavel: string
  email: string
  status: 'ativo' | 'inativo'
  categorias: string[]
}

const orgaosInitial: Orgao[] = [
  {
    id: '1',
    sigla: 'PMR',
    nome: 'Prefeitura do Recife',
    tipo: 'Municipal',
    slaDefault: 48,
    responsavel: 'Fernando Aquino',
    email: 'contato@pmr.pe.gov.br',
    status: 'ativo',
    categorias: ['Via', 'Saneamento', 'Iluminação'],
  },
  {
    id: '2',
    sigla: 'GOPE',
    nome: 'Governo de Pernambuco',
    tipo: 'Estadual',
    slaDefault: 48,
    responsavel: 'Carla Ferreira',
    email: 'contato@gope.pe.gov.br',
    status: 'ativo',
    categorias: ['Rodovia', 'Segurança'],
  },
  {
    id: '3',
    sigla: 'COMPESA',
    nome: 'Companhia de Água',
    tipo: 'Autarquia',
    slaDefault: 48,
    responsavel: 'João Santos',
    email: 'atendimento@compesa.com.br',
    status: 'ativo',
    categorias: ['Água', 'Esgoto'],
  },
  {
    id: '4',
    sigla: 'Energisa',
    nome: 'Energisa Pernambuco',
    tipo: 'Concessionária',
    slaDefault: 24,
    responsavel: 'Lucia Silva',
    email: 'suporte@energisa.com.br',
    status: 'ativo',
    categorias: ['Energia', 'Iluminação'],
  },
  {
    id: '5',
    sigla: 'DETRAN-PE',
    nome: 'Departamento de Trânsito',
    tipo: 'Estadual',
    slaDefault: 36,
    responsavel: 'Roberto Costa',
    email: 'contato@detran.pe.gov.br',
    status: 'ativo',
    categorias: ['Trânsito', 'Segurança'],
  },
]

export default function OrgaosPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [orgaos, setOrgaos] = React.useState<Orgao[]>(orgaosInitial)
  const [editando, setEditando] = React.useState<Orgao | null>(null)
  const [formData, setFormData] = React.useState<Partial<Orgao>>({})

  const handleAdicionarOrgao = () => {
    setEditando(null)
    setFormData({})
    onOpen()
  }

  const handleEditarOrgao = (orgao: Orgao) => {
    setEditando(orgao)
    setFormData(orgao)
    onOpen()
  }

  const handleSalvar = () => {
    if (!formData.sigla || !formData.nome || !formData.email) {
      toast({
        title: 'Preencha todos os campos obrigatórios',
        status: 'warning',
      })
      return
    }

    if (editando) {
      setOrgaos(orgaos.map((o) => (o.id === editando.id ? { ...editando, ...formData } : o)))
      toast({
        title: 'Órgão atualizado',
        status: 'success',
      })
    } else {
      const novoOrgao: Orgao = {
        id: Date.now().toString(),
        status: 'ativo',
        categorias: [],
        ...formData,
      } as Orgao
      setOrgaos([...orgaos, novoOrgao])
      toast({
        title: 'Órgão adicionado',
        status: 'success',
      })
    }

    onClose()
  }

  const handleToggleStatus = (id: string) => {
    setOrgaos(
      orgaos.map((o) => (o.id === id ? { ...o, status: o.status === 'ativo' ? 'inativo' : 'ativo' } : o))
    )
    toast({
      title: 'Status atualizado',
      status: 'success',
    })
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
                          <Heading size="sm" mt={1} color="gray.800">
                            {orgao.nome}
                          </Heading>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            {orgao.tipo}
                          </Text>
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
                  value={formData.sigla || ''}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Nome *</Text>
                <Input
                  placeholder="Ex: Prefeitura do Recife"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Tipo</Text>
                <Select
                  value={formData.tipo || ''}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Selecione..."
                >
                  <option value="Municipal">Municipal</option>
                  <option value="Estadual">Estadual</option>
                  <option value="Autarquia">Autarquia</option>
                  <option value="Concessionária">Concessionária</option>
                </Select>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">SLA Padrão (horas)</Text>
                <Input
                  type="number"
                  placeholder="24"
                  value={formData.slaDefault || ''}
                  onChange={(e) => setFormData({ ...formData, slaDefault: parseInt(e.target.value) })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Responsável</Text>
                <Input
                  placeholder="Nome do responsável"
                  value={formData.responsavel || ''}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Email *</Text>
                <Input
                  type="email"
                  placeholder="contato@orgao.com.br"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </VStack>
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
