"use client"

import { Search, Menu } from "lucide-react"
import { Box, Flex, Input, InputGroup, InputLeftElement, Avatar, IconButton } from "@chakra-ui/react"
import { NotificationPanel } from "@/components/notification-panel"
import useAppStore from "../store/useAppStore"

interface DashboardHeaderProps {
  title: string
}

interface StoreNotification {
  id: string;
  read: boolean;
  [key: string]: unknown;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  // Utilizando o estado global e removendo o mock de dados local
  const notifications = useAppStore((state) => state.notifications) || []
  const setNotifications = useAppStore((state) => state.setNotifications)
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)

  const handleMarkAsRead = (id: string) => {
    if (setNotifications) {
      setNotifications(
        notifications.map((n: StoreNotification) => 
          n.id === id ? { ...n, read: true } : n
        )
      )
    }
  }

  const handleMarkAllAsRead = () => {
    if (setNotifications) {
      setNotifications(
        notifications.map((n: StoreNotification) => ({ ...n, read: true }))
      )
    }
  }

  return (
    <Box 
      as="header" 
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-6"
      bg="white"
      borderColor="gray.200"
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
    >
      <Flex align="center" gap="4">
        <IconButton
          aria-label="Abrir menu"
          variant="ghost"
          icon={<Menu className="h-5 w-5" />}
          className="flex md:hidden"
          display={{ base: "flex", md: "none" }}
        />
        <Box as="h1" className="text-xl font-semibold" color="gray.900" _dark={{ color: "white" }}>
          {title}
        </Box>
      </Flex>

      <Flex align="center" gap="4">
        <Box className="hidden md:block" display={{ base: "none", md: "block" }}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Search className="h-4 w-4" color="gray.500" />
            </InputLeftElement>
            <Input
              type="search"
              placeholder="Pesquisar chamados..."
              className="w-64"
              bg="gray.100"
              border="none"
              _dark={{ bg: "gray.700", color: "white" }}
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery?.(e.target.value)}
            />
          </InputGroup>
        </Box>

        <NotificationPanel
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          variant="manager"
        />

        <Avatar
          name="Maria Costa"
          src="/placeholder-avatar.jpg"
          size="sm"
          className="hidden md:flex"
          display={{ base: "none", md: "flex" }}
          bg="blue.500"
          color="white"
        />
      </Flex>
    </Box>
  )
}
