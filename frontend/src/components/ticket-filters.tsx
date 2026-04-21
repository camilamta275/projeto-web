"use client"

import { Search, X, Building2, Calendar, CheckCircle2 } from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Badge,
  Text
} from "@chakra-ui/react"

export interface FilterState {
  search: string
  orgao: string
  status: string
  dateRange: string
}

interface TicketFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const orgaos = [
  { value: "all", label: "Todos os Órgãos" },
  { value: "compesa", label: "Compesa" },
  { value: "celpe", label: "Celpe" },
  { value: "prefeitura", label: "Prefeitura" },
  { value: "cttu", label: "CTTU" },
  { value: "emlurb", label: "Emlurb" },
]

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "open", label: "Aberto" },
  { value: "in_progress", label: "Em Execução" },
  { value: "completed", label: "Concluído" },
  { value: "critical", label: "Crítico" },
]

const dateRanges = [
  { value: "all", label: "Todas as Datas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Últimos 7 dias" },
  { value: "month", label: "Últimos 30 dias" },
  { value: "quarter", label: "Últimos 3 meses" },
]

export function TicketFilters({ filters, onFiltersChange }: TicketFiltersProps) {
  const activeFiltersCount = [
    filters.orgao !== "all" && filters.orgao,
    filters.status !== "all" && filters.status,
    filters.dateRange !== "all" && filters.dateRange,
  ].filter(Boolean).length

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      orgao: "all",
      status: "all",
      dateRange: "all",
    })
  }

  return (
    <Box 
      borderRadius="lg" 
      borderWidth="1px" 
      bg="white" 
      _dark={{ bg: "gray.800", borderColor: "gray.700" }} 
      p="4" 
      shadow="sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Pesquisa por Protocolo */}
        <Box className="flex-1 max-w-md">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Search className="h-4 w-4" color="var(--chakra-colors-gray-500)" />
            </InputLeftElement>
            <Input
              placeholder="Pesquisar por protocolo..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              fontFamily="mono"
            />
          </InputGroup>
        </Box>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro por Órgão */}
          <InputGroup w={{ base: "full", sm: "180px" }}>
            <InputLeftElement pointerEvents="none">
              <Building2 className="h-4 w-4" color="var(--chakra-colors-gray-500)" />
            </InputLeftElement>
            <Select
              value={filters.orgao}
              onChange={(e) => onFiltersChange({ ...filters, orgao: e.target.value })}
              pl="10"
            >
              {orgaos.map((orgao) => (
                <option key={orgao.value} value={orgao.value}>
                  {orgao.label}
                </option>
              ))}
            </Select>
          </InputGroup>

          {/* Filtro por Status */}
          <InputGroup w={{ base: "full", sm: "180px" }}>
            <InputLeftElement pointerEvents="none">
              <CheckCircle2 className="h-4 w-4" color="var(--chakra-colors-gray-500)" />
            </InputLeftElement>
            <Select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              pl="10"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </InputGroup>

          {/* Filtro por Data */}
          <InputGroup w={{ base: "full", sm: "180px" }}>
            <InputLeftElement pointerEvents="none">
              <Calendar className="h-4 w-4" color="var(--chakra-colors-gray-500)" />
            </InputLeftElement>
            <Select
              value={filters.dateRange}
              onChange={(e) => onFiltersChange({ ...filters, dateRange: e.target.value })}
              pl="10"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </Select>
          </InputGroup>

          {/* Indicador de Filtros Ativos */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              color="gray.500"
              _hover={{ color: "gray.900", _dark: { color: "white" } }}
              leftIcon={<X className="h-4 w-4" />}
            >
              Limpar ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Tags de Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <Flex mt="3" pt="3" borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }} flexWrap="wrap" alignItems="center" gap="2">
          <Text fontSize="xs" color="gray.500">Filtros ativos:</Text>
          {filters.orgao !== "all" && (
            <Badge variant="subtle" colorScheme="gray" display="flex" alignItems="center" gap="1" textTransform="none">
              {orgaos.find((o) => o.value === filters.orgao)?.label}
              <Box as="button" onClick={() => onFiltersChange({ ...filters, orgao: "all" })} ml="1" _hover={{ color: "red.500" }}>
                <X className="h-3 w-3" />
              </Box>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="subtle" colorScheme="gray" display="flex" alignItems="center" gap="1" textTransform="none">
              {statusOptions.find((s) => s.value === filters.status)?.label}
              <Box as="button" onClick={() => onFiltersChange({ ...filters, status: "all" })} ml="1" _hover={{ color: "red.500" }}>
                <X className="h-3 w-3" />
              </Box>
            </Badge>
          )}
          {filters.dateRange !== "all" && (
            <Badge variant="subtle" colorScheme="gray" display="flex" alignItems="center" gap="1" textTransform="none">
              {dateRanges.find((d) => d.value === filters.dateRange)?.label}
              <Box as="button" onClick={() => onFiltersChange({ ...filters, dateRange: "all" })} ml="1" _hover={{ color: "red.500" }}>
                <X className="h-3 w-3" />
              </Box>
            </Badge>
          )}
        </Flex>
      )}
    </Box>
  )
}
