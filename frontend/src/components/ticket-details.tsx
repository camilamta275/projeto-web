"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Clock, Calendar, History } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { SLATimer } from "@/components/sla-timer"
import type { Ticket } from "@/components/ticket-table"
import { TicketActionsPanel } from "@/components/ticket-actions-panel"
import { SLAJustificationModal } from "@/components/sla-justification-modal"
import { 
  Box, 
  Flex, 
  Card, 
  CardHeader, 
  Text, 
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image
} from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

interface TicketDetailsProps {
  ticket: Ticket
  onClose: () => void
}

export interface TicketHistoryItem {
  id: string
  ticketId: string
  action: string
  user: string
  timestamp: string
  details?: string
}

export function TicketDetails({ ticket, onClose }: TicketDetailsProps) {
  const [showSLAModal, setShowSLAModal] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)

  // Acessando histórico via estado global em substituição ao mock
  const allHistory = useAppStore((state) => state.ticketHistory) || []
  const ticketHistory = allHistory.filter((item: TicketHistoryItem) => item.ticketId === ticket.id)

  // Verificar se o prazo de resposta foi excedido
  useEffect(() => {
    if (ticket.slaDeadline) {
      const now = new Date()
      const deadline = new Date(ticket.slaDeadline)
      if (now > deadline && ticket.status !== "completed") {
        setShowSLAModal(true)
      }
    }
  }, [ticket.slaDeadline, ticket.status])

  const handleSLAJustification = (justification: string, reason: string) => {
    // Aqui salvaria a justificativa
    setShowSLAModal(false)
  }

  const handleAction = (action: string, data: Record<string, unknown>) => {
    // Processar ação
  }

  return (
    <>
      <Card className="w-full lg:w-[420px] flex-shrink-0 shadow-lg flex flex-col max-h-[calc(100vh-120px)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <div>
            <CardTitle className="text-lg font-semibold">
              Detalhes do Chamado
            </CardTitle>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {ticket.protocol}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-2" style={{ width: "calc(100% - 2rem)" }}>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="details" className="mt-0 px-6 pb-6">
              <div className="space-y-6">
                {/* Status e SLA */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={ticket.status} />
                  <SLATimer deadline={ticket.slaDeadline} />
                </div>

                {/* Imagem do Chamado */}
                <div className="aspect-video rounded-lg bg-muted overflow-hidden">
                  <img
                    src={ticket.imageUrl || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop"}
                    alt="Foto do chamado"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Informações */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">{ticket.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Data do Registro</p>
                      <p className="text-sm text-muted-foreground">{ticket.date}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Categoria</p>
                      <p className="text-sm text-muted-foreground">{ticket.category}</p>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <p className="text-sm font-medium mb-2">Descrição</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ticket.description || "Buraco de aproximadamente 50cm de diâmetro e 30cm de profundidade na via principal. Risco para veículos e pedestres. Solicitamos urgência no reparo."}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-0 px-6 pb-6">
              <TicketActionsPanel 
                onAction={handleAction}
                ticketProtocol={ticket.protocol}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0 px-6 pb-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Todas as ações registradas neste chamado
                </p>
                <div className="space-y-3">
                  {mockHistory.map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                      {/* Linha conectora */}
                      {index < mockHistory.length - 1 && (
                        <div className="absolute left-[9px] top-6 h-full w-px bg-border" />
                      )}
                      {/* Ponto */}
                      <div className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-primary bg-background" />
                      {/* Conteúdo */}
                      <div className="pb-4">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.user}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.timestamp}
                        </p>
                        {item.details && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>

      {/* Modal de Justificativa de SLA */}
      <SLAJustificationModal
        open={showSLAModal}
        onClose={() => setShowSLAModal(false)}
        onSubmit={handleSLAJustification}
        ticketProtocol={ticket.protocol}
      />
    </>
  )
}
