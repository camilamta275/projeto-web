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
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'

interface RegraCompetencia {
  id: string
  categoria: string
  subcategoria: string
  orgaoPrincipal: string
  orgaoSecundario: string
  slaHoras: number
  prioridade: string
}

const regrasInitial: RegraCompetencia[] = [
  {
    id: '1',
    categoria: 'Água e Esgoto',
    subcategoria: 'Falta de Água',
    orgaoPrincipal: 'COMPESA',
    orgaoSecundario: 'PMR',
    slaHoras: 48,
    prioridade: 'Alta',
  },
  {
    id: '2',
    categoria: 'Energia e Iluminação',
    subcategoria: 'Apagão',
    orgaoPrincipal: 'Energisa',
    orgaoSecundario: 'PMR',
    slaHoras: 24,
    prioridade: 'Crítica',
  },
  {
    id: '3',
    categoria: 'Problemas na Via',
    subcategoria: 'Buraco',
    orgaoPrincipal: 'PMR',
    orgaoSecundario: 'GOPE',
    slaHoras: 72,
    prioridade: 'Média',
  },
  {
    id: '4',
    categoria: 'Saneamento Básico',
    subcategoria: 'Entupimento',
    orgaoPrincipal: 'COMPESA',
    orgaoSecundario: 'PMR',
    slaHoras: 48,
    prioridade: 'Alta',
  },
  {
    id: '5',
    categoria: 'Trânsito e Segurança',
    subcategoria: 'Sinal Quebrado',
    orgaoPrincipal: 'DETRAN-PE',
    orgaoSecundario: 'PMR',
    slaHoras: 36,
    prioridade: 'Média',
  },
]

export default function MatrizPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [regras, setRegras] = React.useState<RegraCompetencia[]>(regrasInitial)
  const [editando, setEditando] = React.useState<RegraCompetencia | null>(null)
  const [formData, setFormData] = React.useState<Partial<RegraCompetencia>>({})

  const handleAdicionarRegra = () => {
    setEditando(null)
    setFormData({})
    onOpen()
  }

  const handleEditarRegra = (regra: RegraCompetencia) => {
    setEditando(regra)
    setFormData(regra)
    onOpen()
  }

  const handleSalvar = () => {
    if (
      !formData.categoria ||
      !formData.subcategoria ||
      !formData.orgaoPrincipal ||
      !formData.slaHoras
    ) {
      toast({
        title: 'Preencha todos os campos',
        status: 'warning',
      })
      return
    }

    if (editando) {
      setRegras(regras.map((r) => (r.id === editando.id ? { ...formData } as RegraCompetencia : r)))
      toast({
        title: 'Regra atualizada',
        status: 'success',
      })
    } else {
      const novaRegra: RegraCompetencia = {
        id: Date.now().toString(),
        ...formData,
      } as RegraCompetencia
      setRegras([...regras, novaRegra])
      toast({
        title: 'Regra adicionada',
        status: 'success',
      })
    }

    onClose()
  }

  const handleDeletar = (id: string) => {
    setRegras(regras.filter((r) => r.id !== id))
    toast({
      title: 'Regra deletada',
      status: 'success',
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box bg="linear-gradient(135deg, #1a365d 0%, #2d3748 100%)" color="white" py={6} px={4}>
        <Container maxW="100%">
          <VStack align="start" spacing={2}>
            <Heading size="lg">🗂️ Matriz de Competências</Heading>
            <Text opacity={0.8}>Gerencie as regras de encaminhamento por categoria</Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="100%" py={6} px={4}>
        <VStack spacing={6} align="stretch">
          {/* Botão Adicionar */}
          <Button
            colorScheme="green"
            leftIcon={<AddIcon />}
            onClick={handleAdicionarRegra}
            alignSelf="flex-start"
          >
            + Adicionar Regra
          </Button>

          {/* Tabela */}
          <Box overflowX="auto">
            <Table size="sm">
              <Thead bg="gray.100">
                <Tr>
                  <Th>Categoria</Th>
                  <Th>Subcategoria</Th>
                  <Th>Órgão Principal</Th>
                  <Th>Órgão Secundário</Th>
                  <Th>SLA (horas)</Th>
                  <Th>Prioridade</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {regras.map((regra) => (
                  <Tr key={regra.id}>
                    <Td fontWeight="bold">{regra.categoria}</Td>
                    <Td>{regra.subcategoria}</Td>
                    <Td>
                      <Badge colorScheme="blue">{regra.orgaoPrincipal}</Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme="gray">{regra.orgaoSecundario}</Badge>
                    </Td>
                    <Td fontWeight="bold">{regra.slaHoras}h</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          regra.prioridade === 'Crítica'
                            ? 'red'
                            : regra.prioridade === 'Alta'
                              ? 'orange'
                              : regra.prioridade === 'Média'
                                ? 'yellow'
                                : 'green'
                        }
                      >
                        {regra.prioridade}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          icon={<EditIcon />}
                          aria-label="Editar"
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEditarRegra(regra)}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label="Deletar"
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeletar(regra.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Total */}
          <Text fontSize="xs" color="gray.600" textAlign="right">
            Total: {regras.length} regra(s)
          </Text>
        </VStack>
      </Container>

      {/* Modal Adicionar/Editar */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editando ? '✏️ Editar Regra' : '➕ Adicionar Regra'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Categoria</Text>
                <Input
                  placeholder="Ex: Água e Esgoto"
                  value={formData.categoria || ''}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Subcategoria</Text>
                <Input
                  placeholder="Ex: Falta de Água"
                  value={formData.subcategoria || ''}
                  onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Órgão Principal</Text>
                <Select
                  value={formData.orgaoPrincipal || ''}
                  onChange={(e) => setFormData({ ...formData, orgaoPrincipal: e.target.value })}
                  placeholder="Selecione..."
                >
                  <option value="PMR">PMR - Prefeitura</option>
                  <option value="GOPE">GOPE - Governo PE</option>
                  <option value="COMPESA">COMPESA - Água</option>
                  <option value="Energisa">Energisa - Energia</option>
                  <option value="DETRAN-PE">DETRAN-PE - Trânsito</option>
                </Select>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Órgão Secundário</Text>
                <Select
                  value={formData.orgaoSecundario || ''}
                  onChange={(e) => setFormData({ ...formData, orgaoSecundario: e.target.value })}
                  placeholder="Selecione..."
                >
                  <option value="PMR">PMR - Prefeitura</option>
                  <option value="GOPE">GOPE - Governo PE</option>
                  <option value="COMPESA">COMPESA - Água</option>
                  <option value="Energisa">Energisa - Energia</option>
                  <option value="DETRAN-PE">DETRAN-PE - Trânsito</option>
                </Select>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">SLA (horas)</Text>
                <Input
                  type="number"
                  placeholder="24"
                  value={formData.slaHoras || ''}
                  onChange={(e) => setFormData({ ...formData, slaHoras: parseInt(e.target.value) })}
                />
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Prioridade</Text>
                <Select
                  value={formData.prioridade || ''}
                  onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                  placeholder="Selecione..."
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </Select>
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
