"use client"

import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  MessageSquare,
  ChevronRight
} from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverBody,
  Text
} from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

export type NotificationType = 
  | "created" 
  | "accepted" 
  | "dispatched" 
  | "status_updated" 
  | "deadline_changed" 
  | "deadline_expired" 
  | "completed"
  | "new_ticket"
  | "sla_warning"
  | "sla_expired"
  | "forwarded"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date | string
  ticketId?: string
  ticketProtocol?: string
  read: boolean
  [key: string]: unknown
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "created":
      return <Box color="blue.500"><CheckCircle2 className="h-4 w-4" /></Box>
    case "accepted":
      return <Box color="orange.500"><Clock className="h-4 w-4" /></Box>
    case "dispatched":
      return <Box color="blue.600"><Users className="h-4 w-4" /></Box>
    case "status_updated":
      return <Box color="blue.500"><MessageSquare className="h-4 w-4" /></Box>
    case "deadline_changed":
      return <Box color="blue.600"><Clock className="h-4 w-4" /></Box>
    case "deadline_expired":
      return <Box color="red.500"><AlertCircle className="h-4 w-4" /></Box>
    case "completed":
      return <Box color="green.500"><CheckCircle2 className="h-4 w-4" /></Box>
    case "new_ticket":
      return <Box color="blue.500"><Bell className="h-4 w-4" /></Box>
    case "sla_warning":
      return <Box color="orange.500"><AlertCircle className="h-4 w-4" /></Box>
    case "sla_expired":
      return <Box color="red.500"><AlertCircle className="h-4 w-4" /></Box>
    case "forwarded":
      return <Box color="blue.500"><ChevronRight className="h-4 w-4" /></Box>
    default:
      return <Box color="gray.500"><Bell className="h-4 w-4" /></Box>
  }
}

const formatRelativeTime = (date: Date | string) => {
  const parsedDate = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - parsedDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "agora"
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return "ontem"
  return `há ${diffDays} dias`
}

interface NotificationPanelProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onNotificationClick?: (notification: Notification) => void
  variant?: "citizen" | "manager"
}

export function NotificationPanel({ 
  notifications: propNotifications, 
  onMarkAsRead: propOnMarkAsRead,
  onMarkAllAsRead: propOnMarkAllAsRead,
  onNotificationClick,
  variant = "citizen"
}: NotificationPanelProps) {
  // Recupera dados do Zustand se não vierem pelas props (mantém versatilidade do componente)
  const storeNotifications = useAppStore((state) => state.notifications) as Notification[] | undefined
  const setNotifications = useAppStore((state) => state.setNotifications)
  
  const notifications = propNotifications || storeNotifications || []
  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    if (propOnMarkAsRead) {
      propOnMarkAsRead(id)
    } else if (setNotifications) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }
  }

  const handleMarkAllAsRead = () => {
    if (propOnMarkAllAsRead) {
      propOnMarkAllAsRead()
    } else if (setNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    }
  }

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative px-2"
          color={variant === "citizen" ? "white" : "gray.600"}
          _dark={{ color: variant === "citizen" ? "white" : "gray.300" }}
          _hover={{ bg: variant === "citizen" ? "whiteAlpha.200" : "gray.100", _dark: { bg: "whiteAlpha.200" } }}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Flex
              className="absolute top-0 right-0 flex items-center justify-center"
              h="4"
              w="4"
              borderRadius="full"
              bg="red.500"
              color="white"
              fontSize="10px"
              fontWeight="bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Flex>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" bg="white" _dark={{ bg: "gray.800", borderColor: "gray.700" }}>
        <PopoverHeader className="flex items-center justify-between p-3 border-b" _dark={{ borderColor: "gray.700" }}>
          <Text fontWeight="semibold" fontSize="sm">Notificações</Text>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              color="blue.500" 
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </PopoverHeader>

        <PopoverBody p="0">
          <Box className="h-[340px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-10 w-10 mb-2" color="var(--chakra-colors-gray-300)" />
                <Text fontSize="sm" color="gray.500">
                Nenhuma notificação
                </Text>
            </div>
          ) : (
              <div className="flex flex-col">
              {notifications.map((notification) => (
                  <Box
                    as="button"
                  key={notification.id}
                    className="w-full text-left p-4 flex items-start gap-3 border-b"
                    borderColor="gray.100"
                    _dark={{ borderColor: "gray.700" }}
                    bg={!notification.read ? "blue.50" : "transparent"}
                    _dark={{ bg: !notification.read ? "whiteAlpha.50" : "transparent" }}
                    transition="colors 0.2s"
                    _hover={{ bg: "gray.50", _dark: { bg: "whiteAlpha.100" } }}
                  onClick={() => {
                      handleMarkAsRead(notification.id)
                      onNotificationClick?.(notification)
                  }}
                >
                    <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                      <Text
                        className="text-sm leading-tight"
                        fontWeight={!notification.read ? "semibold" : "normal"}
                        color="gray.900"
                        _dark={{ color: "white" }}
                      >
                      {notification.title}
                      </Text>
                      <Text className="text-xs mt-1 line-clamp-2" color="gray.500">
                      {notification.message}
                      </Text>
                      <Text className="text-xs mt-1.5" color="gray.400">
                      {formatRelativeTime(notification.timestamp)}
                      </Text>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                        <Box className="h-2 w-2 rounded-full" bg="blue.500" />
                    </div>
                  )}
                  </Box>
              ))}
            </div>
          )}
          </Box>
        </PopoverBody>

        <Box className="border-t p-2" _dark={{ borderColor: "gray.700" }}>
          <Button variant="ghost" className="w-full text-sm" size="sm">
            Ver todas as notificações
          </Button>
        </Box>
      </PopoverContent>
    </Popover>
  )
}
