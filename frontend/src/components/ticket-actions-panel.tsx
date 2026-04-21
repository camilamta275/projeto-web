"use client"

import { useState } from "react"
import { 
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Forward,
  MessageSquare,
  Pause,
  Send,
  Upload,
  Users,
} from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Textarea,
  Input,
  Divider,
  FormControl,
  FormLabel,
  Text,
  IconButton,
  Radio,
  RadioGroup,
  Stack
} from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

type ActionType = 
  | "priority" 
  | "status" 
  | "respond" 
  | "assign" 
  | "forward" 
  | "pause_sla" 
  | "mark_routed"
  | "complete"
  | "merge"

interface TicketActionsPanelProps {
  onAction?: (action: ActionType, data: Record<string, unknown>) => void
  ticketProtocol?: string
}

const priorities = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
  { value: "critical", label: "Crítica" },
]

const statuses = [
  { value: "open", label: "Aberto" },
  { value: "progress", label: "Em Execução" },
  { value: "pending", label: "Aguardando Informação" },
  { value: "completed", label: "Concluído" },
]

const teams = [
  { value: "team1", label: "Equipe Zona Norte" },
  { value: "team2", label: "Equipe Zona Sul" },
  { value: "team3", label: "Equipe Centro" },
  { value: "team4", label: "Equipe Emergência" },
]

const departments = [
  { value: "infra", label: "Secretaria de Infraestrutura" },
  { value: "water", label: "Compesa - Saneamento" },
  { value: "light", label: "Neoenergia - Iluminação" },
  { value: "traffic", label: "CTTU - Trânsito" },
  { value: "health", label: "Secretaria de Saúde" },
]

export function TicketActionsPanel({ onAction, ticketProtocol = "PE-2024-001234" }: TicketActionsPanelProps) {
  const [activeDialog, setActiveDialog] = useState<ActionType | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})

  // Integração com a store global
  const performTicketAction = useAppStore((state) => state.performTicketAction)

  const handleSubmit = async () => {
    if (activeDialog) {
      if (performTicketAction) {
        await performTicketAction(ticketProtocol, activeDialog, formData)
      }
      onAction?.(activeDialog, formData)
      setActiveDialog(null)
      setFormData({})
    }
  }

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-3">
      {/* Ações Principais */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          justifyContent="flex-start"
          gap="2"
          py="6"
          onClick={() => setActiveDialog("priority")}
        >
          <AlertTriangle className="h-4 w-4" color="var(--chakra-colors-orange-500)" />
          <Text fontSize="sm" fontWeight="medium">Alterar Prioridade</Text>
        </Button>
        
        <Button 
          variant="outline" 
          justifyContent="flex-start"
          gap="2"
          py="6"
          onClick={() => setActiveDialog("status")}
        >
          <Clock className="h-4 w-4" color="var(--chakra-colors-blue-500)" />
          <Text fontSize="sm" fontWeight="medium">Alterar Status</Text>
        </Button>
      </div>

      <Button 
        variant="outline" 
        w="full"
        justifyContent="flex-start"
        gap="2"
        py="6"
        onClick={() => setActiveDialog("respond")}
      >
        <MessageSquare className="h-4 w-4" color="var(--chakra-colors-blue-500)" />
        <Text fontSize="sm" fontWeight="medium">Responder ao Cidadão</Text>
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          justifyContent="flex-start"
          gap="2"
          py="6"
          onClick={() => setActiveDialog("assign")}
        >
          <Users className="h-4 w-4" />
          <Text fontSize="sm" fontWeight="medium">Designar Equipe</Text>
        </Button>
        
        <Button 
          variant="outline" 
          justifyContent="flex-start"
          gap="2"
          py="6"
          onClick={() => setActiveDialog("forward")}
        >
          <Forward className="h-4 w-4" />
          <Text fontSize="sm" fontWeight="medium">Encaminhar</Text>
        </Button>
      </div>

      <Button 
        variant="outline" 
        w="full"
        justifyContent="flex-start"
        gap="2"
        py="6"
        color="orange.500"
        borderColor="orange.200"
        _hover={{ bg: "orange.50", _dark: { bg: "orange.900" } }}
        onClick={() => setActiveDialog("pause_sla")}
      >
        <Pause className="h-4 w-4" />
        <Text fontSize="sm" fontWeight="medium">Pausar Tempo de Resposta</Text>
      </Button>

      <Button 
        variant="outline" 
        w="full"
        justifyContent="flex-start"
        gap="2"
        py="6"
        color="blue.500"
        borderColor="blue.200"
        _hover={{ bg: "blue.50", _dark: { bg: "blue.900" } }}
        onClick={() => setActiveDialog("mark_routed")}
      >
        <ArrowRight className="h-4 w-4" />
        <Text fontSize="sm" fontWeight="medium">Destinado ao Setor Responsável</Text>
      </Button>

      <Divider />

      <Button 
        w="full"
        colorScheme="green"
        gap="2"
        onClick={() => setActiveDialog("complete")}
      >
        <CheckCircle2 className="h-4 w-4" />
        Concluir Chamado
      </Button>

      <Button 
        variant="solid"
        colorScheme="gray"
        w="full"
        gap="2"
        onClick={() => setActiveDialog("merge")}
      >
        <Check className="h-4 w-4" />
        Agrupar com Duplicado
      </Button>

      {/* Dialog: Alterar Prioridade */}
      <Modal isOpen={activeDialog === "priority"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Alterar Prioridade
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <FormControl isRequired>
              <FormLabel>Nova Prioridade</FormLabel>
              <Select value={formData.priority || ""} onChange={(e) => updateFormData("priority", e.target.value)} placeholder="Selecione a prioridade">
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Justificativa</FormLabel>
              <Textarea
                placeholder="Descreva o motivo da alteração de prioridade..."
                value={formData.justification || ""}
                onChange={(e) => updateFormData("justification", e.target.value)}
                rows={3}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.priority || !formData.justification}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Alterar Status */}
      <Modal isOpen={activeDialog === "status"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Alterar Status
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <FormControl isRequired>
              <FormLabel>Novo Status</FormLabel>
              <Select value={formData.status || ""} onChange={(e) => updateFormData("status", e.target.value)} placeholder="Selecione o status">
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Mensagem para o Cidadão (pública)</FormLabel>
              <Textarea
                placeholder="Esta mensagem será visível para o cidadão..."
                value={formData.publicMessage || ""}
                onChange={(e) => updateFormData("publicMessage", e.target.value)}
                rows={3}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.status}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Responder ao Cidadão */}
      <Modal isOpen={activeDialog === "respond"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Responder ao Cidadão
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol} - Visível no histórico</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="py-4">
            <FormControl isRequired>
              <FormLabel>Mensagem</FormLabel>
              <Textarea
                placeholder="Digite sua resposta ao cidadão..."
                value={formData.response || ""}
                onChange={(e) => updateFormData("response", e.target.value)}
                rows={5}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.response?.trim()} leftIcon={<Send className="h-4 w-4" />}>
              Enviar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Designar Equipe */}
      <Modal isOpen={activeDialog === "assign"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Designar Equipe
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <FormControl isRequired>
              <FormLabel>Equipe</FormLabel>
              <Select value={formData.team || ""} onChange={(e) => updateFormData("team", e.target.value)} placeholder="Selecione a equipe">
                {teams.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Técnico Responsável (opcional)</FormLabel>
              <Input
                placeholder="Nome do técnico"
                value={formData.technician || ""}
                onChange={(e) => updateFormData("technician", e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.team}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Encaminhar */}
      <Modal isOpen={activeDialog === "forward"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Encaminhar para Outro Setor
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <Box borderRadius="md" bg="gray.100" p="3" _dark={{ bg: "gray.700" }}>
              <Text fontSize="sm" fontWeight="medium" mb="1">Histórico de Encaminhamentos</Text>
              <Text fontSize="xs" color="gray.500">
                Secretaria de Infraestrutura (origem) - 15/04/2024 09:30
              </Text>
            </Box>
            <FormControl isRequired>
              <FormLabel>Setor de Destino</FormLabel>
              <Select value={formData.department || ""} onChange={(e) => updateFormData("department", e.target.value)} placeholder="Selecione o setor">
                {departments.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Justificativa do Encaminhamento</FormLabel>
              <Textarea
                placeholder="Descreva o motivo do encaminhamento..."
                value={formData.forwardReason || ""}
                onChange={(e) => updateFormData("forwardReason", e.target.value)}
                rows={3}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.department || !formData.forwardReason} leftIcon={<Forward className="h-4 w-4" />}>
              Encaminhar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Pausar SLA */}
      <Modal isOpen={activeDialog === "pause_sla"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Pausar Tempo de Resposta
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <Box borderRadius="md" bg="orange.50" border="1px" borderColor="orange.200" p="3" _dark={{ bg: "orange.900", borderColor: "orange.700" }}>
              <Text fontSize="sm" color="orange.600" fontWeight="medium" _dark={{ color: "orange.300" }}>Atenção</Text>
              <Text fontSize="xs" color="gray.600" mt="1" _dark={{ color: "gray.300" }}>
                Pausar o tempo de resposta requer justificativa obrigatória e será registrado no histórico do chamado.
              </Text>
            </Box>
            <FormControl isRequired>
              <FormLabel>Justificativa Obrigatória</FormLabel>
              <Textarea
                placeholder="Descreva o motivo da pausa no tempo de resposta..."
                value={formData.pauseReason || ""}
                onChange={(e) => updateFormData("pauseReason", e.target.value)}
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              isDisabled={!formData.pauseReason?.trim()}
              colorScheme="orange"
            >
              Pausar Tempo de Resposta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Marcar como Destinado */}
      <Modal isOpen={activeDialog === "mark_routed"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Destinado ao Setor Responsável
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <Text fontSize="sm" color="gray.500">
              Confirmar que este chamado foi oficialmente direcionado ao setor responsável.
              Esta ação registrará seu nome e o timestamp.
            </Text>
            <Box borderRadius="md" bg="blue.50" border="1px" borderColor="blue.200" p="3" _dark={{ bg: "blue.900", borderColor: "blue.700" }}>
              <Text fontSize="sm" fontWeight="medium">Responsável: Maria Costa</Text>
              <Text fontSize="xs" color="gray.500" mt="1">
                Data/Hora: {new Date().toLocaleString("pt-BR")}
              </Text>
            </Box>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} leftIcon={<Check className="h-4 w-4" />}>
              Confirmar Destinação
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Concluir Chamado */}
      <Modal isOpen={activeDialog === "complete"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Concluir Chamado
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Chamado {ticketProtocol}</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <FormControl isRequired>
              <FormLabel>Descrição da Resolução</FormLabel>
              <Textarea
                placeholder="Descreva detalhadamente como o problema foi resolvido..."
                value={formData.resolution || ""}
                onChange={(e) => updateFormData("resolution", e.target.value)}
                rows={4}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Foto do Serviço Realizado</FormLabel>
              <Box 
                border="2px dashed" 
                borderColor="gray.300" 
                borderRadius="md" 
                p="6" 
                textAlign="center" 
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
                _dark={{ borderColor: "gray.600", _hover: { bg: "gray.700" } }}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <Text fontSize="sm" color="gray.500">
                  Clique para fazer upload ou arraste a imagem
                </Text>
                <Text fontSize="xs" color="gray.400" mt="1">
                  PNG, JPG até 10MB
                </Text>
              </Box>
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              isDisabled={!formData.resolution?.trim()}
              colorScheme="green"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Concluir Chamado
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Agrupar com Duplicado */}
      <Modal isOpen={activeDialog === "merge"} onClose={() => setActiveDialog(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Agrupar com Chamado Duplicado
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Buscar chamados similares por localização ou categoria</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <Flex gap="2">
              <Input
                placeholder="Buscar por protocolo, localização ou categoria..."
                value={formData.searchDuplicate || ""}
                onChange={(e) => updateFormData("searchDuplicate", e.target.value)}
              />
              <IconButton aria-label="Buscar" variant="outline" icon={<ChevronDown className="h-4 w-4" />} />
            </Flex>
            <Box borderRadius="md" border="1px" borderColor="gray.200" p="3" _dark={{ borderColor: "gray.700" }}>
              <Text fontSize="sm" fontWeight="medium" mb="3">Chamados Similares Encontrados</Text>
              <RadioGroup value={formData.duplicateProtocol || ""} onChange={(v) => updateFormData("duplicateProtocol", v)}>
                <Stack spacing="2">
                  {[
                    { protocol: "PE-2024-001230", location: "Rua da Aurora, 480", distance: "30m" },
                    { protocol: "PE-2024-001215", location: "Rua da Aurora, 420", distance: "50m" },
                  ].map((item) => (
                    <Radio key={item.protocol} value={item.protocol} colorScheme="blue" alignItems="flex-start">
                      <Box flex="1" ml="2">
                        <Text fontSize="sm" fontWeight="medium">{item.protocol}</Text>
                        <Text fontSize="xs" color="gray.500">{item.location}</Text>
                      </Box>
                      <Text fontSize="xs" color="gray.500" position="absolute" right="4">{item.distance}</Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={() => setActiveDialog(null)}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.duplicateProtocol}>
              Agrupar Chamados
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
