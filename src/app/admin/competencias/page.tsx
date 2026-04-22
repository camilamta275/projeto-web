'use client'

import React from 'react'
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
} from '@chakra-ui/react'

export default function CompetenciasPage() {
  const competencias = [
    {
      id: '1',
      categoria: 'Problemas na Via',
      orgao: 'PMR',
      sla: '48h',
      prioridade: 'Alta',
    },
    {
      id: '2',
      categoria: 'Água e Esgoto',
      orgao: 'COMPESA',
      sla: '36h',
      prioridade: 'Alta',
    },
    {
      id: '3',
      categoria: 'Iluminação Pública',
      orgao: 'Energisa',
      sla: '24h',
      prioridade: 'Média',
    },
    {
      id: '4',
      categoria: 'Saneamento Básico',
      orgao: 'GOPE',
      sla: '72h',
      prioridade: 'Crítica',
    },
    {
      id: '5',
      categoria: 'Sinalização',
      orgao: 'DETRAN-PE',
      sla: '48h',
      prioridade: 'Média',
    },
  ]

  const prioridadeColors: Record<string, string> = {
    Baixa: 'green',
    Média: 'yellow',
    Alta: 'orange',
    Crítica: 'red',
  }

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Matriz de Competências</Heading>
            <Text color="gray.500">Associação de categorias com órgãos responsáveis</Text>
          </Box>
          <Button colorScheme="primary">➕ Nova Competência</Button>
        </HStack>

        <Box bg="white" borderRadius="lg" boxShadow="sm" overflowX="auto">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Categoria</Th>
                <Th>Órgão Responsável</Th>
                <Th>SLA</Th>
                <Th>Prioridade</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {competencias.map((comp) => (
                <Tr key={comp.id} borderBottom="1px" borderColor="gray.200">
                  <Td fontWeight="bold">{comp.categoria}</Td>
                  <Td>{comp.orgao}</Td>
                  <Td>{comp.sla}</Td>
                  <Td>
                    <Badge colorScheme={prioridadeColors[comp.prioridade]}>
                      {comp.prioridade}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size="sm" variant="ghost">
                        ✏️ Editar
                      </Button>
                      <Button size="sm" variant="ghost" colorScheme="red">
                        🗑️ Deletar
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  )
}
