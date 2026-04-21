"use client"

import { useState } from "react"
import { 
  Camera, 
  Check, 
  Clock, 
  Mail, 
  Shield, 
  TrendingUp, 
  User 
} from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Card,
  CardHeader,
  CardBody,
  Text,
  Avatar,
  Input,
  Switch,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react"
import { useAppStore } from "../store/useAppStore"

export interface ManagerProfileData {
  name: string
  registration: string
  role: string
  department: string
  sectors: string[]
  avatar?: string
  stats: {
    totalTickets: number
    avgResolutionTime: string
    slaCompliance: number
  }
}

const fallbackManager: ManagerProfileData = {
  name: "Maria Costa",
  registration: "MAT-2024-0456",
  role: "Gestora Regional",
  department: "Secretaria de Infraestrutura",
  sectors: ["Zona Norte", "Centro"],
  stats: {
    totalTickets: 342,
    avgResolutionTime: "2.4 dias",
    slaCompliance: 94,
  },
}

export function ManagerProfile() {
  // Recupera os dados do gestor pela store global, com um fallback por segurança
  const manager = useAppStore((state) => state.currentUser) || fallbackManager
  
  const [notifications, setNotifications] = useState({
    newTicket: true,
    slaWarning: true,
    slaExpired: true,
    forwarded: true,
    emailNewTicket: false,
    emailSlaWarning: true,
    emailSlaExpired: true,
    emailForwarded: false,
  })

  const { isOpen: isPasswordModalOpen, onOpen: onOpenPasswordModal, onClose: onClosePasswordModal } = useDisclosure()
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handlePasswordChange = () => {
    // Simular alteração de senha
    onClosePasswordModal()
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Box>
        <Text as="h1" fontSize="2xl" fontWeight="bold" letterSpacing="tight" color="gray.900" _dark={{ color: "white" }}>
          Meu Perfil
        </Text>
        <Text color="gray.500">
          Gerencie suas informações e configurações de notificação
        </Text>
      </Box>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card Principal - Informações */}
        <Card bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg" className="lg:col-span-2">
          <CardHeader pb="0">
            <Text fontSize="lg" fontWeight="semibold">Informações Pessoais</Text>
            <Text fontSize="sm" color="gray.500">
              Dados vinculados à sua conta de gestor
            </Text>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Avatar */}
            <Flex align="center" gap="6">
              <Box position="relative">
                <Avatar 
                  size="2xl" 
                  name={manager.name} 
                  src={manager.avatar} 
                  bg="blue.500" 
                  color="white" 
                />
                <IconButton
                  aria-label="Alterar foto"
                  icon={<Camera className="h-4 w-4" />}
                  size="sm"
                  isRound
                  position="absolute"
                  bottom="-1"
                  right="-1"
                  bg="gray.100"
                  _dark={{ bg: "gray.700" }}
                />
              </Box>
              <Box>
                <Text fontSize="xl" fontWeight="semibold">{manager.name}</Text>
                <Text color="gray.500">{manager.role}</Text>
                <Badge colorScheme="gray" mt="2" display="flex" alignItems="center" w="fit-content" gap="1">
                  <Shield className="h-3 w-3" />
                  Gestor
                </Badge>
              </Box>
            </Flex>

            <Divider />

            {/* Dados do Cadastro */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormControl>
                <FormLabel fontSize="xs" color="gray.500" mb="1">Matrícula Funcional</FormLabel>
                <Flex align="center" gap="2" p="3" borderRadius="lg" bg="gray.50" _dark={{ bg: "gray.700" }}>
                  <User className="h-4 w-4 text-gray-500" />
                  <Text fontFamily="mono" fontSize="sm">{manager.registration}</Text>
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.500" mb="1">Cargo</FormLabel>
                <Flex align="center" gap="2" p="3" borderRadius="lg" bg="gray.50" _dark={{ bg: "gray.700" }}>
                  <Shield className="h-4 w-4 text-gray-500" />
                  <Text fontSize="sm">{manager.role}</Text>
                </Flex>
              </FormControl>

              <FormControl className="sm:col-span-2">
                <FormLabel fontSize="xs" color="gray.500" mb="1">Órgão Vinculado</FormLabel>
                <Flex align="center" gap="2" p="3" borderRadius="lg" bg="gray.50" _dark={{ bg: "gray.700" }}>
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Text fontSize="sm">{manager.department}</Text>
                </Flex>
              </FormControl>

              <FormControl className="sm:col-span-2">
                <FormLabel fontSize="xs" color="gray.500" mb="1" display="flex" alignItems="center">
                  Setores de Atuação
                  <Text as="span" ml="2" fontSize="xs" color="gray.400">
                    (definido pelo administrador)
                  </Text>
                </FormLabel>
                <Flex flexWrap="wrap" gap="2">
                  {manager.sectors.map((sector) => (
                    <Badge key={sector} variant="outline" colorScheme="gray">
                      {sector}
                    </Badge>
                  ))}
                </Flex>
              </FormControl>
            </div>

            <Divider />

            {/* Alterar Senha */}
            <Flex align="center" justify="space-between">
              <Box>
                <Text fontWeight="medium">Senha</Text>
                <Text fontSize="sm" color="gray.500">
                  Altere sua senha de acesso
                </Text>
              </Box>
              
              <Button variant="outline" onClick={onOpenPasswordModal}>Alterar Senha</Button>
              
              <Modal isOpen={isPasswordModalOpen} onClose={onClosePasswordModal} isCentered>
                <ModalOverlay />
                <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
                  <ModalHeader>Alterar Senha</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <Text fontSize="sm" color="gray.500" mb="4">
                       Preencha os campos para definir uma nova senha
                    </Text>
                    <Box className="space-y-4">
                      <FormControl>
                        <FormLabel>Senha Atual</FormLabel>
                      <Input
                        type="password"
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, current: e.target.value }))
                        }
                      />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Nova Senha</FormLabel>
                      <Input
                        type="password"
                        value={passwords.new}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, new: e.target.value }))
                        }
                      />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                      <Input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) =>
                          setPasswords((p) => ({ ...p, confirm: e.target.value }))
                        }
                      />
                      </FormControl>
                    </Box>
                  </ModalBody>
                  <ModalFooter gap="2">
                    <Button
                      variant="outline"
                      onClick={onClosePasswordModal}
                    >
                      Cancelar
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={handlePasswordChange}
                      isDisabled={
                        !passwords.current ||
                        !passwords.new ||
                        passwords.new !== passwords.confirm
                      }
                    >
                      Salvar
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Flex>
          </CardBody>
        </Card>

        {/* Card Estatísticas */}
        <div className="space-y-6">
          <Card bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg">
            <CardHeader pb="0">
              <Text fontWeight="semibold">Estatísticas Pessoais</Text>
            </CardHeader>
            <CardBody className="space-y-4">
              <Flex align="center" gap="3">
                <Flex h="10" w="10" align="center" justify="center" borderRadius="lg" bg="blue.50" _dark={{ bg: "blue.900" }}>
                  <TrendingUp className="h-5 w-5" color="#3182ce" />
                </Flex>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold">{manager.stats.totalTickets}</Text>
                  <Text fontSize="xs" color="gray.500">Chamados Gerenciados</Text>
                </Box>
              </Flex>

              <Divider />

              <Flex align="center" gap="3">
                <Flex h="10" w="10" align="center" justify="center" borderRadius="lg" bg="orange.50" _dark={{ bg: "orange.900" }}>
                  <Clock className="h-5 w-5" color="#dd6b20" />
                </Flex>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold">{manager.stats.avgResolutionTime}</Text>
                  <Text fontSize="xs" color="gray.500">Tempo Médio de Resolução</Text>
                </Box>
              </Flex>

              <Divider />

              <Flex align="center" gap="3">
                <Flex h="10" w="10" align="center" justify="center" borderRadius="lg" bg="green.50" _dark={{ bg: "green.900" }}>
                  <Check className="h-5 w-5" color="#38a169" />
                </Flex>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold">{manager.stats.slaCompliance}%</Text>
                  <Text fontSize="xs" color="gray.500">Taxa de Cumprimento de Prazo</Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Card Notificações */}
          <Card bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg">
            <CardHeader pb="0">
              <Text fontWeight="semibold">Configurações de Notificação</Text>
              <Text fontSize="sm" color="gray.500">
                Escolha quais eventos geram alertas
              </Text>
            </CardHeader>
            <CardBody className="space-y-4">
              <Box className="space-y-3">
                <Text fontSize="sm" fontWeight="medium">No Sistema</Text>
                <Box className="space-y-2">
                  {[
                    { key: "newTicket", label: "Novo chamado no setor" },
                    { key: "slaWarning", label: "Prazo próximo do vencimento" },
                    { key: "slaExpired", label: "Prazo encerrado" },
                    { key: "forwarded", label: "Chamado encaminhado" },
                  ].map(({ key, label }) => (
                    <Flex key={key} align="center" justify="space-between">
                      <Text fontSize="sm" color="gray.500">{label}</Text>
                      <Switch
                        colorScheme="blue"
                        isChecked={notifications[key as keyof typeof notifications]}
                        onChange={() =>
                          handleNotificationChange(key as keyof typeof notifications)
                        }
                      />
                    </Flex>
                  ))}
                </Box>
              </Box>

              <Divider />

              <Box className="space-y-3">
                <Text fontSize="sm" fontWeight="medium">Por E-mail</Text>
                <Box className="space-y-2">
                  {[
                    { key: "emailNewTicket", label: "Novo chamado no setor" },
                    { key: "emailSlaWarning", label: "Prazo próximo do vencimento" },
                    { key: "emailSlaExpired", label: "Prazo encerrado" },
                    { key: "emailForwarded", label: "Chamado encaminhado" },
                  ].map(({ key, label }) => (
                    <Flex key={key} align="center" justify="space-between">
                      <Text fontSize="sm" color="gray.500">{label}</Text>
                      <Switch
                        colorScheme="blue"
                        isChecked={notifications[key as keyof typeof notifications]}
                        onChange={() =>
                          handleNotificationChange(key as keyof typeof notifications)
                        }
                      />
                    </Flex>
                  ))}
                </Box>
              </Box>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
