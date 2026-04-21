"use client"

import { StatusBadge, type TicketStatus } from "@/components/status-badge"
import { SLATimer } from "@/components/sla-timer"
import { Copy, MapPin, Eye } from "lucide-react"
import { 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  TableContainer, 
  Button, 
  IconButton, 
  Flex, 
  Text,
  Box
} from "@chakra-ui/react"

export interface Ticket {
  id: string
  protocol: string
  date: string
  category: string
  status: TicketStatus
  location: string
  slaDeadline: Date
  hasDuplicates: boolean
  duplicateCount?: number
  description?: string
  imageUrl?: string
}

interface TicketTableProps {
  tickets: Ticket[]
  onSelectTicket: (ticket: Ticket) => void
  selectedTicketId?: string
}

export function TicketTable({ tickets, onSelectTicket, selectedTicketId }: TicketTableProps) {
  return (
    <TableContainer>
      <Table variant="simple" size="md">
        <Thead bg="gray.50" _dark={{ bg: "gray.800" }}>
          <Tr>
            <Th w="120px" textTransform="none" fontSize="xs">Protocolo</Th>
            <Th w="100px" textTransform="none" fontSize="xs">Data</Th>
            <Th textTransform="none" fontSize="xs">Categoria</Th>
            <Th w="120px" textTransform="none" fontSize="xs">Status</Th>
            <Th textTransform="none" fontSize="xs">Localização</Th>
            <Th w="120px" textTransform="none" fontSize="xs">SLA</Th>
            <Th w="140px" textTransform="none" fontSize="xs" textAlign="right">Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tickets.map((ticket) => (
            <Tr
              key={ticket.id}
              cursor="pointer"
              transition="colors 0.2s"
              bg={selectedTicketId === ticket.id ? "blue.50" : "transparent"}
              _dark={{ bg: selectedTicketId === ticket.id ? "whiteAlpha.100" : "transparent" }}
              _hover={{ 
                bg: selectedTicketId === ticket.id ? "blue.100" : "gray.50", 
                _dark: { bg: selectedTicketId === ticket.id ? "whiteAlpha.200" : "whiteAlpha.50" } 
              }}
              borderLeftWidth={ticket.hasDuplicates ? "4px" : "0px"}
              borderLeftColor="orange.400"
              onClick={() => onSelectTicket(ticket)}
            >
              <Td fontFamily="mono" fontSize="sm" fontWeight="medium">
                {ticket.protocol}
              </Td>
              <Td color="gray.500" _dark={{ color: "gray.400" }}>
                {ticket.date}
              </Td>
              <Td>{ticket.category}</Td>
              <Td>
                <StatusBadge status={ticket.status} />
              </Td>
              <Td>
                <Flex align="center" gap="1.5">
                  <Box color="gray.400"><MapPin className="h-3.5 w-3.5" /></Box>
                  <Text fontSize="sm">{ticket.location}</Text>
                </Flex>
              </Td>
              <Td>
                <SLATimer deadline={ticket.slaDeadline} />
              </Td>
              <Td>
                <Flex align="center" justify="flex-end" gap="1">
                  {ticket.hasDuplicates && (
                    <Button
                      variant="ghost"
                      size="sm"
                      h="8"
                      fontSize="xs"
                      colorScheme="orange"
                      leftIcon={<Copy className="h-3.5 w-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      Mesclar ({ticket.duplicateCount})
                    </Button>
                  )}
                  <IconButton
                    aria-label="Visualizar"
                    variant="ghost"
                    size="sm"
                    h="8"
                    w="8"
                    icon={<Eye className="h-4 w-4" />}
                    color="gray.500"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectTicket(ticket)
                    }}
                  />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
