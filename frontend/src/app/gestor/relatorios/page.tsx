'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Container, VStack, HStack, Heading, Text, Box, SimpleGrid, Select, 
  Button, Divider, Progress, Table, Thead, Tbody, Tr, Th, Td, useToast
} from '@chakra-ui/react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function RelatoriosPage() {
  const [filtroMes, setFiltroMes] = useState('atual')
  const [isClient, setIsClient] = useState(false)
  const toast = useToast()

  // Evita erros de hidratação no Next.js
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Centraliza todos os dados que mudam conforme o filtro
  const dadosRelatorio = useMemo(() => {
    if (filtroMes === 'atual') {
      return {
        total: 1000,
        status: [
          { name: 'Concluídos', value: 750, color: '#22c55e' },
          { name: 'Em Aberto', value: 150, color: '#3182ce' },
          { name: 'Atrasados', value: 100, color: '#ef4444' },
        ],
        tendencia: [
          { mes: 'Semana 1', chamados: 30 },
          { mes: 'Semana 2', chamados: 45 },
          { mes: 'Semana 3', chamados: 25 },
          { mes: 'Semana 4', chamados: 60 },
        ],
        categorias: [
          { nome: 'Iluminação Pública', total: 145, resolvidos: 130, cor: 'yellow' },
          { nome: 'Saneamento', total: 88, resolvidos: 40, cor: 'blue' },
          { nome: 'Buraco na Via', total: 210, resolvidos: 180, cor: 'orange' },
        ]
      }
    } else if (filtroMes === 'anterior') {
      return {
        total: 850,
        status: [
          { name: 'Concluídos', value: 600, color: '#22c55e' },
          { name: 'Em Aberto', value: 200, color: '#3182ce' },
          { name: 'Atrasados', value: 50, color: '#ef4444' },
        ],
        tendencia: [
          { mes: 'Semana 1', chamados: 40 },
          { mes: 'Semana 2', chamados: 30 },
          { mes: 'Semana 3', chamados: 55 },
          { mes: 'Semana 4', chamados: 35 },
        ],
        categorias: [
          { nome: 'Iluminação Pública', total: 120, resolvidos: 110, cor: 'yellow' },
          { nome: 'Saneamento', total: 100, resolvidos: 60, cor: 'blue' },
          { nome: 'Buraco na Via', total: 150, resolvidos: 140, cor: 'orange' },
        ]
      }
    }
    // Padrão para "Últimos 3 meses"
    return {
      total: 2500,
      status: [
        { name: 'Concluídos', value: 1800, color: '#22c55e' },
        { name: 'Em Aberto', value: 500, color: '#3182ce' },
        { name: 'Atrasados', value: 200, color: '#ef4444' },
      ],
      tendencia: [
        { mes: 'Mês 1', chamados: 120 },
        { mes: 'Mês 2', chamados: 95 },
        { mes: 'Mês 3', chamados: 150 },
      ],
      categorias: [
        { nome: 'Geral', total: 2500, resolvidos: 1800, cor: 'green' }
      ]
    }
  }, [filtroMes])

  const exportarExcel = () => {
    const dataToExport = dadosRelatorio.categorias.map(cat => ({
      Categoria: cat.nome,
      Total: cat.total,
      Resolvidos: cat.resolvidos,
      Taxa: `${Math.round((cat.resolvidos / cat.total) * 100)}%`
    }))
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Relatorio")
    XLSX.writeFile(wb, `Relatorio_${filtroMes}.xlsx`)
    toast({ title: "Excel gerado!", status: "success", duration: 2000 })
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text(`Relatório de Performance - ${filtroMes}`, 14, 15)
    autoTable(doc, {
      startY: 25,
      head: [['Categoria', 'Total', 'Resolvidos', 'Taxa %']],
      body: dadosRelatorio.categorias.map(cat => [
        cat.nome, 
        cat.total, 
        cat.resolvidos, 
        `${Math.round((cat.resolvidos / cat.total) * 100)}%`
      ]),
    })
    doc.save(`Relatorio_${filtroMes}.pdf`)
    toast({ title: "PDF gerado!", status: "success", duration: 2000 })
  }

  if (!isClient) return null

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" flexWrap="wrap">
          <VStack align="start" spacing={0}>
            <Heading size="lg">📊 Relatórios Gerenciais</Heading>
            <Text color="gray.500">Total Filtrado: {dadosRelatorio.total}</Text>
          </VStack>
          
          <HStack spacing={3}>
            <Select 
              size="sm" 
              value={filtroMes} 
              onChange={(e) => setFiltroMes(e.target.value)} 
              w="160px" 
              bg="white"
            >
              <option value="atual">Mês Atual</option>
              <option value="anterior">Mês Anterior</option>
              <option value="ultimos3">Últimos 3 Meses</option>
            </Select>
            <Button colorScheme="blue" size="sm" onClick={exportarPDF}>Gerar PDF</Button>
            <Button variant="outline" size="sm" bg="white" onClick={exportarExcel}>Exportar Excel</Button>
          </HStack>
        </HStack>

        <Divider />

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Gráfico de Pizza dinâmico */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb={6}>Status dos Chamados</Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={dadosRelatorio.status} 
                    innerRadius={60} 
                    outerRadius={80} 
                    dataKey="value"
                  >
                    {dadosRelatorio.status.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Gráfico de Linha dinâmico */}
          <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200">
            <Heading size="sm" mb={6}>Tendência do Período</Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosRelatorio.tendencia}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="chamados" 
                    stroke="#3182ce" 
                    strokeWidth={3} 
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </SimpleGrid>

        {/* Tabela dinâmica */}
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px" borderColor="gray.200">
          <Heading size="sm" mb={6}>Performance por Categoria</Heading>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th>Categoria</Th>
                <Th>Volume</Th>
                <Th>Resolução</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dadosRelatorio.categorias.map((cat, i) => (
                <Tr key={i}>
                  <Td fontWeight="medium">{cat.nome}</Td>
                  <Td>{cat.total}</Td>
                  <Td>
                    <HStack spacing={3}>
                      <Progress 
                        value={(cat.resolvidos/cat.total)*100} 
                        colorScheme={cat.cor} 
                        size="xs" 
                        flex={1} 
                        borderRadius="full" 
                      />
                      <Text fontSize="xs" fontWeight="bold">
                        {Math.round((cat.resolvidos/cat.total)*100)}%
                      </Text>
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