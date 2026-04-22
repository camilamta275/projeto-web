"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { TicketQueue } from "@/components/ticket-queue"
import { HeatmapPlaceholder } from "@/components/heatmap-placeholder"
import { CompetencyMatrix } from "@/components/admin/competency-matrix"
import { UserManagement } from "@/components/admin/user-management"
import { ManagerProfile } from "@/components/manager-profile"
import { Box, Flex, Card, CardHeader, CardBody, Text } from "@chakra-ui/react"
import { BarChart3, Users, Clock, TrendingUp } from "lucide-react"
import {useAppStore} from "../store/useAppStore"

interface GestorDashboardProps {
  showAdmin?: boolean
}

export type DashboardSection = "queue" | "heatmap" | "admin" | "users" | "profile"

interface StatItem {
  title: string
  value: string
  change: string
  icon: React.ElementType
  color: string
}

const defaultStats: StatItem[] = [
  { title: "Total de Chamados", value: "1.247", change: "+12%", icon: BarChart3, color: "blue.500" },
  { title: "Em Aberto", value: "342", change: "-8%", icon: Clock, color: "orange.500" },
  { title: "Resolvidos (Mês)", value: "856", change: "+23%", icon: TrendingUp, color: "green.500" },
  { title: "Cidadãos Atendidos", value: "2.431", change: "+5%", icon: Users, color: "purple.500" },
]

export function GestorDashboard({ showAdmin = false }: GestorDashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>(
    showAdmin ? "admin" : "queue"
  )

  // Utilizando estado global para os dados da dashboard
  const dashboardStats = useAppStore((state) => state.dashboardStats) || defaultStats

  const renderContent = () => {
    switch (activeSection) {
      case "heatmap":
        return (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat: StatItem) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg">
                    <CardHeader display="flex" flexDir="row" alignItems="center" justifyContent="space-between" pb="2">
                      <Text fontSize="sm" fontWeight="medium" color="gray.500">
                        {stat.title}
                      </Text>
                      <Box color={stat.color}>
                        <Icon className="h-4 w-4" />
                      </Box>
                    </CardHeader>
                    <CardBody pt="0">
                      <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                        {stat.value}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        <Box as="span" color={stat.change.startsWith("+") ? "green.500" : "red.500"}>
                          {stat.change}
                        </Box>
                        {" "}vs. mês anterior
                      </Text>
                    </CardBody>
                  </Card>
                )
              })}
            </div>
            <HeatmapPlaceholder />
          </div>
        )
      case "queue":
        return <TicketQueue />
      case "admin":
        return <CompetencyMatrix />
      case "users":
        return <UserManagement />
      case "profile":
        return <ManagerProfile />
      default:
        return null
    }
  }

  const getTitle = () => {
    switch (activeSection) {
      case "queue": return "Fila de Chamados"
      case "heatmap": return "Dashboard"
      case "profile": return "Meu Perfil"
      case "users": return "Gestão de Usuários"
      case "admin": return "Matriz de Competências"
      default: return "Dashboard"
    }
  }

  return (
    <Flex h="100vh" w="100%" overflow="hidden" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <AppSidebar 
        onNavigate={setActiveSection} 
        activeSection={activeSection}
        showAdmin={showAdmin}
      />
      <Flex flex="1" direction="column" overflow="hidden">
        <DashboardHeader title={getTitle()} />
        <Box as="main" flex="1" overflow="auto" p="6">
          {renderContent()}
        </Box>
      </Flex>
    </Flex>
  )
}
