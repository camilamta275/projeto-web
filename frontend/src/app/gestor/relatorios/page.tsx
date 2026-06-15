'use client'

import React, { useEffect, useMemo } from 'react'
import {
  Container, VStack, HStack, Heading, Text, Box, SimpleGrid,
  Button, Divider, Progress, Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Alert, AlertIcon, Badge, useToast,
} from '@chakra-ui/react'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useGestorStore } from '@/stores/gestorStore'
import { useAuthStore } from '@/stores/authStore'

const STATUS_COLORS = ['#3182ce', '#8b5cf6', '#22c55e', '#6b7280']
const CATEGORIA_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4']

export default function RelatoriosPage() {
  const { usuario } = useAuthStore()
  const { metricas, loading, error, fetchMetricas } = useGestorStore()
  const toast = useToast()

  useEffect(() => {
    if (usuario && !metricas) fetchMetricas(usuario.orgaoId ?? '')
  }, [usuario?.id, metricas, fetchMetricas])

  const statusData = useMemo(() => {
    if (!metricas) return []
    return [
      { name: 'Em Aberto', value: metricas.chamadosAbertos, color: STATUS_COLORS[0] },
      { name: 'Em Andamento', value: metricas.chamadosEmProgresso, color: STATUS_COLORS[1] },
      { name: 'Resolvidos', value: metricas.chamadosEncerrados, color: STATUS_COLORS[2] },
    ].filter(d => d.value > 0)
  }, [metricas])

  const categoriaData = useMemo(() =>
    (metricas?.demandasPorCategoria || []).filter(d => d.total > 0),
    [metricas]
  )

  const exportarExcel = () => {
    if (!metricas) return
    const ws = XLSX.utils.json_to_sheet(
      categoriaData.map(cat => ({
        Categoria: cat.category,
        Total: cat.total,
        'Distribuição (%)': cat.percentage,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Categorias')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { Métrica: 'Total de Chamados', Valor: metricas.totalChamados },
      { Métrica: 'Em Aberto', Valor: metricas.chamadosAbertos },
      { Métrica: 'Em Andamento', Valor: metricas.chamadosEmProgresso },
      { Métrica: 'Encerrados', Valor: metricas.chamadosEncerrados },
      { Métrica: 'Tempo Médio de Resolução (h)', Valor: metricas.tempoMedioResolucao ?? 'N/D' },
    ]), 'Resumo')
    XLSX.writeFile(wb, 'Relatorio_Fiscalize.xlsx')
    toast({ title: 'Excel gerado!', status: 'success', duration: 2000 })
  }

  const exportarPDF = () => {
    if (!metricas) return
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Relatório Gerencial — Fiscalize', 14, 15)
    doc.setFontSize(10)
    doc.text(`Total de chamados: ${metricas.totalChamados}`, 14, 25)
    doc.text(`Tempo médio de resolução: ${metricas.tempoMedioResolucao != null ? `${metricas.tempoMedioResolucao}h` : 'N/D'}`, 14, 31)

    autoTable(doc, {
      startY: 40,
      head: [['Categoria', 'Total', 'Distribuição (%)']],
      body: categoriaData.map(cat => [cat.category, cat.total, `${cat.percentage}%`]),
    })
    doc.save('Relatorio_Fiscalize.pdf')
    toast({ title: 'PDF gerado!', status: 'success', duration: 2000 })
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" py={20}>
      <Spinner size="xl" />
    </Box>
  )

  if (error) return (
    <Container maxW="container.xl" py={6}>
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Erro ao carregar dados: {error}
      </Alert>
    </Container>
  )

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">

        {/* Header */}
        <HStack justify="space-between" flexWrap="wrap">
          <VStack align="start" spacing={0}>
            <Heading size="lg">📊 Relatórios Gerenciais</Heading>
            <Text color="gray.500">
              Total de chamados: <strong>{metricas?.totalChamados ?? '—'}</strong>
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button colorScheme="blue" size="sm" onClick={exportarPDF} isDisabled={!metricas}>
              Gerar PDF
            </Button>
            <Button variant="outline" size="sm" bg="white" onClick={exportarExcel} isDisabled={!metricas}>
              Exportar Excel
            </Button>
          </HStack>
        </HStack>

        <Divider />

        {/* KPIs */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
          {[
            { label: 'Total', value: metricas?.totalChamados, color: 'blue' },
            { label: 'Em Aberto', value: metricas?.chamadosAbertos, color: 'orange' },
            { label: 'Em Andamento', value: metricas?.chamadosEmProgresso, color: 'purple' },
            { label: 'Encerrados', value: metricas?.chamadosEncerrados, color: 'green' },
            {
              label: 'Tempo Médio',
              value: metricas?.tempoMedioResolucao != null
                ? `${metricas.tempoMedioResolucao}h`
                : 'N/D',
              color: 'teal',
            },
          ].map((kpi, i) => (
            <Box key={i} bg={`${kpi.color}.50`} p={4} borderRadius="xl" border="1px" borderColor={`${kpi.color}.100`}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">{kpi.label}</Text>
              <Text fontSize="2xl" fontWeight="bold" color={`${kpi.color}.700`}>{kpi.value ?? '—'}</Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Gráficos */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

          {/* Pizza: status */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb={6}>Status dos Chamados</Heading>
            {statusData.length === 0 ? (
              <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.400" fontSize="sm">Sem dados disponíveis</Text>
              </Box>
            ) : (
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} innerRadius={60} outerRadius={100} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${v} chamados`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

          {/* Barras: volume por categoria */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb={6}>Volume por Categoria</Heading>
            {categoriaData.length === 0 ? (
              <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.400" fontSize="sm">Sem dados disponíveis</Text>
              </Box>
            ) : (
              <Box h="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriaData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="category" width={110} fontSize={11} />
                    <Tooltip formatter={(v) => [`${v} demandas`, 'Total']} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                      {categoriaData.map((_, i) => (
                        <Cell key={i} fill={CATEGORIA_COLORS[i % CATEGORIA_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

        </SimpleGrid>

        {/* Tabela: distribuição por categoria */}
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200">
          <Heading size="sm" mb={6}>Distribuição por Categoria</Heading>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Categoria</Th>
                <Th isNumeric>Demandas</Th>
                <Th>Distribuição</Th>
                <Th isNumeric>%</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(metricas?.demandasPorCategoria || []).map((cat, i) => (
                <Tr key={i}>
                  <Td fontWeight="medium">
                    <HStack spacing={2}>
                      <Box w={3} h={3} borderRadius="full" bg={CATEGORIA_COLORS[i % CATEGORIA_COLORS.length]} />
                      <Text>{cat.category}</Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>{cat.total}</Td>
                  <Td>
                    <Progress
                      value={cat.percentage}
                      colorScheme="blue"
                      size="xs"
                      borderRadius="full"
                    />
                  </Td>
                  <Td isNumeric>
                    <Badge colorScheme={cat.total > 0 ? 'blue' : 'gray'} variant="subtle">
                      {cat.percentage}%
                    </Badge>
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
