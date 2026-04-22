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
    <Box>
      {/* Header */}
      <Box bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)" color="white" py={6} px={4}>
        <Container maxW="100%">
          <VStack align="start" spacing={2}>
            <Heading size="lg">🏢 Órgãos</Heading>
            <Text opacity={0.8}>Gerencie os órgãos públicos da plataforma</Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">
          {/* Botão Adicionar */}
          <Button
            colorScheme="green"
            leftIcon={<AddIcon />}
            onClick={handleAdicionarOrgao}
            alignSelf="flex-start"
          >
            + Novo Órgão
          </Button>

          {/* Grid de Cards */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {orgaos.map((orgao) => (
              <Card
                key={orgao.id}
                borderTopWidth="4px"
                borderTopColor={orgao.status === 'ativo' ? 'green.500' : 'gray.400'}
                _hover={{ boxShadow: 'md' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="start" spacing={3} width="100%">
                    {/* Header */}
                    <HStack justify="space-between" width="100%">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.600">
                          Sigla
                        </Text>
                        <Heading size="sm">{orgao.sigla}</Heading>
                      </VStack>
                      <Badge colorScheme={orgao.status === 'ativo' ? 'green' : 'gray'}>
                        {orgao.status === 'ativo' ? '✓ Ativo' : '⊗ Inativo'}
                      </Badge>
                    </HStack>

                    {/* Informações */}
                    <VStack align="start" spacing={2} width="100%" fontSize="sm">
                      <Box width="100%">
                        <Text fontWeight="bold">{orgao.nome}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {orgao.tipo}
                        </Text>
                      </Box>

                      <Box width="100%">
                        <Text fontSize="xs" color="gray.600" fontWeight="bold">
                          Responsável
                        </Text>
                        <Text fontSize="sm">{orgao.responsavel}</Text>
                      </Box>

                      <Box width="100%">
                        <Text fontSize="xs" color="gray.600" fontWeight="bold">
                          Email
                        </Text>
                        <Text fontSize="xs" fontFamily="monospace" color="blue.600">
                          {orgao.email}
                        </Text>
                      </Box>

                      <Box width="100%">
                        <Text fontSize="xs" color="gray.600" fontWeight="bold">
                          SLA Padrão
                        </Text>
                        <Badge colorScheme="blue">{orgao.slaDefault}h</Badge>
                      </Box>
                    </VStack>

                    {/* Categorias */}
                    <Box width="100%">
                      <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={2}>
                        Categorias
                      </Text>
                      <Wrap spacing={1}>
                        {orgao.categorias.map((cat, idx) => (
                          <Badge key={idx} size="sm" colorScheme="purple">
                            {cat}
                          </Badge>
                        ))}
                      </Wrap>
                    </Box>

                    {/* Botões */}
                    <HStack spacing={2} width="100%" pt={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        flex={1}
                        onClick={() => handleEditarOrgao(orgao)}
                      >
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

          {/* Total */}
          <Text fontSize="xs" color="gray.600" textAlign="right">
            Total: {orgaos.length} órgão(s)
          </Text>
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
