"use client";

import {
  Box,
  Flex,
  Avatar,
  AvatarBadge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
} from "@chakra-ui/react";
import {
  LayoutDashboard,
  ListTodo,
  Map,
  Settings,
  Building2,
  ChevronDown,
  LogOut,
  Shield,
} from "lucide-react";

interface AppSidebarProps {
  onNavigate?: (section: "queue" | "heatmap" | "admin") => void;
  activeSection?: "queue" | "heatmap" | "admin";
  showAdmin?: boolean;
}

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    section: "heatmap" as const,
  },
  {
    title: "Fila de Chamados",
    icon: ListTodo,
    section: "queue" as const,
  },
  {
    title: "Mapa de Calor",
    icon: Map,
    section: "heatmap" as const,
  },
];

const adminItems = [
  {
    title: "Matriz de Competências",
    icon: Settings,
    section: "admin" as const,
  },
];

export function AppSidebar({
  onNavigate,
  activeSection = "queue",
  showAdmin = false,
}: AppSidebarProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      h="100vh"
      bg="gray.800"
      color="white"
    >
      <Flex
        align="center"
        p="4"
        borderBottom="1px solid"
        borderColor="gray.700"
      >
        <Flex align="center" gap="3">
          <Flex
            h="10"
            w="10"
            align="center"
            justify="center"
            borderRadius="lg"
            bg="blue.500"
          >
            <Building2 className="h-5 w-5 text-white" />
          </Flex>
          <Box>
            <Text fontSize="sm" fontWeight="bold">
              Smart City
            </Text>
            <Text fontSize="xs" color="gray.400">
              Help Desk PE
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Box flex="1" p="4">
        <Box mb="4">
          <Text fontSize="xs" color="gray.400" mb="2">
            Principal
          </Text>
          {navigationItems.map((item) => (
            <Flex
              key={item.title}
              align="center"
              p="2"
              borderRadius="md"
              bg={
                activeSection === item.section ? "blue.600" : "transparent"
              }
              cursor="pointer"
              onClick={() => onNavigate?.(item.section)}
              _hover={{ bg: "blue.700" }}
            >
              <item.icon className="h-4 w-4" />
              <Text ml="2">{item.title}</Text>
            </Flex>
          ))}
        </Box>

        {showAdmin && (
          <Box>
            <Text fontSize="xs" color="gray.400" mb="2">
              <Shield className="h-3.5 w-3.5 mr-1.5 inline" /> Super Admin
            </Text>
            {adminItems.map((item) => (
              <Flex
                key={item.title}
                align="center"
                p="2"
                borderRadius="md"
                bg={
                  activeSection === item.section ? "blue.600" : "transparent"
                }
                cursor="pointer"
                onClick={() => onNavigate?.(item.section)}
                _hover={{ bg: "blue.700" }}
              >
                <item.icon className="h-4 w-4" />
                <Text ml="2">{item.title}</Text>
              </Flex>
            ))}
          </Box>
        )}
      </Box>

      <Flex
        align="center"
        p="4"
        borderTop="1px solid"
        borderColor="gray.700"
      >
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="User menu"
            icon={<ChevronDown />}
            variant="ghost"
          >
            <Flex align="center">
              <Avatar
                size="sm"
                name="Maria Costa"
                src="/placeholder-avatar.jpg"
              >
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
              <Box ml="3" textAlign="left">
                <Text fontSize="sm" fontWeight="medium">
                  Maria Costa
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Gestora Regional
                </Text>
              </Box>
            </Flex>
          </MenuButton>
          <MenuList bg="gray.800" borderColor="gray.700">
            <MenuItem icon={<Settings className="h-4 w-4" />}>
              Configurações
            </MenuItem>
            <MenuItem
              icon={<LogOut className="h-4 w-4" />}
              color="red.500"
            >
              Sair
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}
