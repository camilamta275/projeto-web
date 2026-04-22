"use client"

import { useRouter } from "next/navigation"
import { Plus, MapPin, ChevronRight } from "lucide-react"
import {
  Box,
  Flex,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Card,
  CardBody,
  Stack,
  Show
} from "@chakra-ui/react"
import { useAppStore } from "../../store/useAppStore"
import { StatusBadge } from "../../components/status-badge"
import type { Ticket } from "../../components/ticket-table"

export default function MinhasDemandasPage() {
  const router = useRouter()
  const tickets = useAppStore((state) => state.tickets) || []
  
  // Recupera as demandas (simulando filtro do usuário logado)
  const userTickets = tickets.slice(0, 6)

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }} p={{ base: 4, md: 8 }}>
      <Box maxW="7xl" mx="auto">
        
        {/* Cabeçalho Unificado (Adaptável Mobile/Desktop) */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }} 
          gap={4} 
          mb={8}
        >
          <Box>
            <Heading size="lg" color="gray.900" _dark={{ color: "white" }} letterSpacing="tight">
              Minhas Demandas
            </Heading>
            <Text color="gray.500" mt={1}>
              Acompanhe o status das suas solicitações
            </Text>
          </Box>
          <Button 
            colorScheme="blue" 
            size="lg" 
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/nova-solicitacao')}
          >
            Nova Solicitação
          </Button>
        </Flex>

        {/* Visão Mobile (Celular) - Renderizada apenas em telas pequenas */}
        <Show below="md">
          <Stack spacing={4}>
            {userTickets.map((ticket: Ticket) => (
              <Card 
                key={ticket.id} 
                bg="white" 
                _dark={{ bg: "gray.800" }} 
                shadow="sm" 
                borderRadius="xl"
                onClick={() => router.push(`/minhas-demandas/${ticket.id}`)}
                cursor="pointer"
                _active={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                transition="background 0.2s"
              >
                <CardBody p={4}>
                  <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box pr={4}>
                      <Text fontWeight="semibold" fontSize="md" color="gray.900" _dark={{ color: "white" }} noOfLines={1}>
                        {ticket.category}
                      </Text>
                      <Text fontSize="xs" color="gray.500" fontFamily="mono" mt={0.5}>
                        {ticket.protocol} • {ticket.date}
                      </Text>
                    </Box>
                    <StatusBadge status={ticket.status} />
                  </Flex>
                  
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap={1.5} color="gray.500" overflow="hidden" flex={1} mr={4}>
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <Text fontSize="sm" noOfLines={1}>
                        {ticket.location}
                      </Text>
                    </Flex>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </Flex>
                </CardBody>
              </Card>
            ))}
            
            {userTickets.length === 0 && (
              <Text textAlign="center" color="gray.500" py={8}>
                Você ainda não possui nenhuma demanda registrada.
              </Text>
            )}
          </Stack>
        </Show>

        {/* Visão Desktop (Telas Grandes) - Renderizada apenas de Tablets para cima */}
        <Show above="md">
          <Card bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg" overflow="hidden">
            <TableContainer>
              <Table variant="simple">
                <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                  <Tr>
                    <Th>Protocolo</Th>
                    <Th>Data</Th>
                    <Th>Categoria</Th>
                    <Th>Localização</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {userTickets.map((ticket: Ticket) => (
                    <Tr 
                      key={ticket.id}
                      _hover={{ bg: "gray.50", _dark: { bg: "whiteAlpha.50" } }}
                      cursor="pointer"
                      onClick={() => router.push(`/minhas-demandas/${ticket.id}`)}
                    >
                      <Td fontWeight="medium" fontFamily="mono" fontSize="sm">{ticket.protocol}</Td>
                      <Td color="gray.500">{ticket.date}</Td>
                      <Td fontWeight="medium">{ticket.category}</Td>
                      <Td color="gray.500">
                        <Flex align="center" gap={2}>
                          <MapPin className="h-4 w-4" />
                          <Text isTruncated maxW="250px">{ticket.location}</Text>
                        </Flex>
                      </Td>
                      <Td><StatusBadge status={ticket.status} /></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        </Show>
      </Box>
    </Box>
  )
}