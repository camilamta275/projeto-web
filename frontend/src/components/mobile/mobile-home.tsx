"use client"

import { Plus, ChevronRight, Building2 } from "lucide-react"
import { Box, Flex, Button, Card, CardHeader, CardBody, Text, Avatar, IconButton } from "@chakra-ui/react"
import { StatusBadge } from "@/components/status-badge"
import { NotificationPanel } from "@/components/notification-panel"
import { useAppStore } from "../../store/useAppStore"
import type { Ticket } from "@/components/ticket-table"

interface MobileHomeProps {
  onNewTicket?: () => void
  onViewTicket?: (ticketId: string) => void
}

export function MobileHome({ onNewTicket, onViewTicket }: MobileHomeProps) {
  const currentUser = useAppStore((state) => state.currentUser) || { name: "João Silva" }
  const tickets = useAppStore((state) => state.tickets) || []
  
  // Em um cenário real, filtraria pelos tickets do usuário logado
  const userTickets = tickets.slice(0, 3)

  const handleNotificationClick = (notification: Record<string, unknown>) => {
    if (notification.ticketProtocol) {
      onViewTicket?.(notification.ticketProtocol as string)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      {/* Header */}
      <Box as="header" position="sticky" top="0" zIndex="50" bg="blue.600" px="4" py="6" color="white">
        <Flex align="center" justify="space-between">
          <Flex align="center" gap="3">
            <Avatar 
              size="md" 
              name={currentUser.name} 
              src="/placeholder-avatar.jpg" 
              borderWidth="2px" 
              borderColor="whiteAlpha.400"
              bg="blue.400"
            />
            <Box>
              <Text fontSize="sm" color="whiteAlpha.800">Olá,</Text>
              <Text fontSize="lg" fontWeight="semibold">{currentUser.name}</Text>
            </Box>
          </Flex>
          <NotificationPanel
            onNotificationClick={handleNotificationClick}
            variant="citizen"
          />
        </Flex>

        {/* Logo */}
        <Flex mt="6" align="center" gap="2">
          <Flex h="8" w="8" align="center" justify="center" borderRadius="lg" bg="whiteAlpha.200">
            <Building2 className="h-4 w-4" />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="semibold">Smart City Help Desk</Text>
            <Text fontSize="xs" color="whiteAlpha.700">Pernambuco</Text>
          </Box>
        </Flex>
      </Box>

      {/* Content */}
      <Box as="main" p="4" pb="24">
        {/* Card de Estatísticas */}
        <Card mb="6" borderWidth="0" shadow="lg" bg="white" _dark={{ bg: "gray.800" }} borderRadius="xl">
          <CardBody p="4">
            <Flex justify="space-between" textAlign="center" gap="4">
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">{userTickets.length}</Text>
                <Text fontSize="xs" color="gray.500">Meus Chamados</Text>
              </Box>
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {userTickets.filter((t: Ticket) => t.status === "progress").length}
                </Text>
                <Text fontSize="xs" color="gray.500">Em Andamento</Text>
              </Box>
              <Box flex="1">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {userTickets.filter((t: Ticket) => t.status === "completed").length}
                </Text>
                <Text fontSize="xs" color="gray.500">Resolvidos</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Últimos Chamados */}
        <Card borderWidth="0" shadow="lg" bg="white" _dark={{ bg: "gray.800" }} borderRadius="xl">
          <CardHeader pb="3">
            <Flex align="center" justify="space-between">
              <Text fontSize="md" fontWeight="semibold" color="gray.900" _dark={{ color: "white" }}>
              Meus Últimos Chamados
              </Text>
              <Button variant="ghost" size="sm" colorScheme="blue" fontSize="sm">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Flex>
          </CardHeader>
          <CardBody className="space-y-3" pt="0">
            {userTickets.map((ticket: Ticket) => (
              <Flex
                key={ticket.id}
                align="center"
                justify="space-between"
                borderRadius="lg"
                bg="gray.50"
                _dark={{ bg: "gray.700" }}
                p="3"
                transition="colors 0.2s"
                _active={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
              >
                <Box flex="1" minW="0">
                  <Flex align="center" gap="2" mb="1">
                    <Text fontSize="sm" fontWeight="medium" isTruncated>{ticket.category}</Text>
                    <StatusBadge status={ticket.status} />
                  </Flex>
                  <Text fontSize="xs" color="gray.500" isTruncated>
                    {ticket.location}
                  </Text>
                  <Text fontSize="xs" color="gray.500" mt="0.5">
                    {ticket.date} • {ticket.protocol}
                  </Text>
                </Box>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </Flex>
            ))}
          </CardBody>
        </Card>
      </Box>

      {/* FAB - Floating Action Button */}
      <IconButton
        aria-label="Novo Registro"
        icon={<Plus className="h-6 w-6" />}
        onClick={onNewTicket}
        position="fixed"
        bottom="6"
        right="6"
        h="14"
        w="14"
        borderRadius="full"
        shadow="lg"
        colorScheme="blue"
      />
    </Box>
  )
}
