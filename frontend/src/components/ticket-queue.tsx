"use client"

import { useState } from "react"
import { TicketTable, type Ticket } from "@/components/ticket-table"
import { TicketDetails } from "@/components/ticket-details"
import { TicketFilters, type FilterState } from "@/components/ticket-filters"
import { Pagination } from "@/components/pagination"
import { Box, Text } from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

export function TicketQueue() {
  // Recupera tickets reais a partir do gerenciamento de estado global
  const tickets = useAppStore((state) => state.tickets) || []
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    orgao: "all",
    status: "all",
    dateRange: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filtrar tickets
  const filteredTickets = tickets.filter((ticket: Ticket) => {
    if (filters.search && !ticket.protocol.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.status !== "all") {
      const statusMap: Record<string, string> = {
        open: "open",
        in_progress: "progress",
        completed: "completed",
        critical: "critical",
      }
      if (ticket.status !== statusMap[filters.status]) {
        return false
      }
    }
    return true
  })

  // Paginação
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage)
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Lista de Chamados */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Filtros Avançados */}
        <TicketFilters filters={filters} onFiltersChange={setFilters} />

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Box borderRadius="lg" bg="white" _dark={{ bg: "gray.800" }} p="3" borderWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.700" }}>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="gray.900" _dark={{ color: "white" }}>
              {tickets.length}
            </Text>
            <Text fontSize="xs" color="gray.500">Total</Text>
          </Box>
          <Box borderRadius="lg" bg="blue.50" _dark={{ bg: "blue.900", borderColor: "blue.800" }} p="3" borderWidth="1px" borderColor="blue.200">
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="blue.500" _dark={{ color: "blue.300" }}>
              {tickets.filter((t: Ticket) => t.status === "open").length}
            </Text>
            <Text fontSize="xs" color="blue.600" _dark={{ color: "blue.400" }}>Abertos</Text>
          </Box>
          <Box borderRadius="lg" bg="orange.50" _dark={{ bg: "orange.900", borderColor: "orange.800" }} p="3" borderWidth="1px" borderColor="orange.200">
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="orange.600" _dark={{ color: "orange.300" }}>
              {tickets.filter((t: Ticket) => t.status === "progress").length}
            </Text>
            <Text fontSize="xs" color="orange.600" _dark={{ color: "orange.400" }}>Em Execução</Text>
          </Box>
          <Box borderRadius="lg" bg="red.50" _dark={{ bg: "red.900", borderColor: "red.800" }} p="3" borderWidth="1px" borderColor="red.200">
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="red.500" _dark={{ color: "red.300" }}>
              {tickets.filter((t: Ticket) => t.status === "critical").length}
            </Text>
            <Text fontSize="xs" color="red.600" _dark={{ color: "red.400" }}>Críticos</Text>
          </Box>
        </div>

        {/* Tabela com Paginação */}
        <Box borderRadius="lg" borderWidth="1px" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }} shadow="sm" overflow="hidden">
          <TicketTable 
            tickets={paginatedTickets}
            onSelectTicket={setSelectedTicket}
            selectedTicketId={selectedTicket?.id}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTickets.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </Box>
      </div>

      {/* Painel de Detalhes */}
      {selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}
    </div>
  )
}
