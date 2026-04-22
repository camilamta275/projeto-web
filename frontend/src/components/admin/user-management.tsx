"use client"

import { useState } from "react"
import { 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  User,
  UserCheck,
  UserX
} from "lucide-react"
import {
  Box,
  Flex,
  Button,
  Input,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardBody,
  Heading,
  Text,
  InputGroup,
  InputLeftElement
} from "@chakra-ui/react"
import { useAppStore } from "../../store/useAppStore"

export interface SystemUser {
  id: string
  name: string
  email: string
  profile: "citizen" | "manager" | "admin"
  department?: string
  sector?: string
  status: "active" | "inactive"
  createdAt: string
}

const departments = [
  "Secretaria de Infraestrutura",
  "Compesa - Saneamento",
  "Neoenergia - Iluminação",
  "CTTU - Trânsito",
  "Secretaria de Saúde",
  "TI - Governo",
]

const sectors = [
  "Zona Norte",
  "Zona Sul",
  "Centro",
  "Zona Oeste",
  "Saneamento",
  "Iluminação",
  "Trânsito",
]

const profileLabels = {
  citizen: { label: "Cidadão", colorScheme: "gray" },
  manager: { label: "Gestor", colorScheme: "blue" },
  admin: { label: "Admin", colorScheme: "red" },
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export function UserManagement() {
  // Integração com a Store Global
  const systemUsers = useAppStore((state) => state.systemUsers) || []
  const addSystemUser = useAppStore((state) => state.addSystemUser)
  const updateSystemUser = useAppStore((state) => state.updateSystemUser)
  const toggleSystemUserStatus = useAppStore((state) => state.toggleSystemUserStatus)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterProfile, setFilterProfile] = useState<string>("all")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    profile: "citizen" as "citizen" | "manager" | "admin",
    department: "",
    sector: "",
    tempPassword: generatePassword(),
  })

  const itemsPerPage = 10

  // Filtrar usuários
  const filteredUsers = systemUsers.filter((user: SystemUser) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProfile = filterProfile === "all" || user.profile === filterProfile
    const matchesDepartment =
      filterDepartment === "all" || user.department === filterDepartment
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesProfile && matchesDepartment && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCreateUser = () => {
    const user: SystemUser = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      profile: newUser.profile,
      department: newUser.profile !== "citizen" ? newUser.department : undefined,
      sector: newUser.profile === "manager" ? newUser.sector : undefined,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }
    
    if (addSystemUser) addSystemUser(user)

    setShowNewUserDialog(false)
    setNewUser({
      name: "",
      email: "",
      profile: "citizen",
      department: "",
      sector: "",
      tempPassword: generatePassword(),
    })
  }

  const handleEditUser = () => {
    if (!selectedUser) return
    
    if (updateSystemUser) updateSystemUser(selectedUser.id, selectedUser)
    
    setShowEditDialog(false)
    setSelectedUser(null)
  }

  const handleToggleStatus = (id: string) => {
    if (toggleSystemUserStatus) toggleSystemUserStatus(id)
  }

  const handleResetPassword = (user: SystemUser) => {
    // Simular envio de e-mail
    alert(`E-mail de redefinição de senha enviado para ${user.email}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Flex direction={{ base: "column", sm: "row" }} align={{ sm: "center" }} justify="space-between" gap="4">
        <Box>
          <Heading size="lg" letterSpacing="tight">Gestão de Usuários</Heading>
          <Text color="gray.500">
            Gerencie os usuários do sistema
          </Text>
        </Box>
        <Button colorScheme="blue" onClick={() => setShowNewUserDialog(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Novo Usuário
        </Button>
      </Flex>

      {/* Filtros */}
      <Card bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg">
        <CardBody p="4">
          <Flex direction={{ base: "column", lg: "row" }} align={{ lg: "center" }} gap="4">
            <Box flex="1">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Search className="h-4 w-4 text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="white"
                  _dark={{ bg: "gray.900" }}
                />
              </InputGroup>
            </Box>
            <Flex flexWrap="wrap" gap="2">
              <Select w={{ base: "full", sm: "140px" }} value={filterProfile} onChange={(e) => setFilterProfile(e.target.value)}>
                <option value="all">Todos Perfis</option>
                <option value="citizen">Cidadão</option>
                <option value="manager">Gestor</option>
                <option value="admin">Admin</option>
              </Select>

              <Select w={{ base: "full", sm: "180px" }} value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                <option value="all">Todos Órgãos</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>

              <Select w={{ base: "full", sm: "130px" }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </Select>
            </Flex>
          </Flex>
        </CardBody>
      </Card>

      {/* Tabela */}
      <Card bg="white" _dark={{ bg: "gray.800" }} shadow="sm" borderRadius="lg" overflow="hidden">
        <TableContainer>
          <Table variant="simple">
            <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
              <Tr>
                <Th>Nome</Th>
                <Th>E-mail</Th>
                <Th>Perfil</Th>
                <Th display={{ base: "none", md: "table-cell" }}>Órgão</Th>
                <Th display={{ base: "none", lg: "table-cell" }}>Cadastro</Th>
                <Th>Status</Th>
                <Th width="50px"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedUsers.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="medium">{user.name}</Td>
                  <Td color="gray.500">{user.email}</Td>
                  <Td>
                    <Badge colorScheme={profileLabels[user.profile].colorScheme}>
                      {profileLabels[user.profile].label}
                    </Badge>
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }} color="gray.500">
                    {user.department || "-"}
                  </Td>
                  <Td display={{ base: "none", lg: "table-cell" }} color="gray.500">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={user.status === "active" ? "green" : "gray"}
                    >
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MoreHorizontal className="h-4 w-4" />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<User className="h-4 w-4" />}
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditDialog(true)
                          }}
                        >
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === "active" ? (
                            "Desativar"
                          ) : (
                            "Reativar"
                          )}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<RefreshCw className="h-4 w-4" />} onClick={() => handleResetPassword(user)}>
                          Redefinir Senha
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

          {/* Paginação */}
        <Flex align="center" justify="space-between" px="4" py="3" borderTopWidth="1px" borderColor="gray.100" _dark={{ borderColor: "gray.700" }}>
          <Text fontSize="sm" color="gray.500">
              Mostrando {paginatedUsers.length} de {filteredUsers.length} usuários
          </Text>
          <Flex align="center" gap="2">
              <Button
                variant="outline"
              size="sm"
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Text fontSize="sm">
              Página {currentPage} de {totalPages || 1}
            </Text>
              <Button
                variant="outline"
              size="sm"
              isDisabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Dialog: Novo Usuário */}
      <Modal isOpen={showNewUserDialog} onClose={() => setShowNewUserDialog(false)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Novo Usuário
            <Text fontSize="sm" color="gray.500" fontWeight="normal" mt="1">
              Preencha os dados para criar uma nova conta
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <FormControl isRequired>
              <FormLabel>Nome Completo</FormLabel>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Perfil</FormLabel>
              <Select
                value={newUser.profile}
                onChange={(e) =>
                  setNewUser((u) => ({ ...u, profile: e.target.value as "citizen" | "manager" | "admin" }))
                }
              >
                <option value="citizen">Cidadão</option>
                <option value="manager">Gestor</option>
                <option value="admin">Administrador</option>
              </Select>
            </FormControl>

            {newUser.profile !== "citizen" && (
              <FormControl isRequired>
                <FormLabel>Órgão</FormLabel>
                <Select
                  value={newUser.department}
                  onChange={(e) => setNewUser((u) => ({ ...u, department: e.target.value }))}
                  placeholder="Selecione o órgão"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </FormControl>
            )}

            {newUser.profile === "manager" && (
              <FormControl isRequired>
                <FormLabel>Setor de Atuação</FormLabel>
                <Select
                  value={newUser.sector}
                  onChange={(e) => setNewUser((u) => ({ ...u, sector: e.target.value }))}
                  placeholder="Selecione o setor"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Senha Temporária</FormLabel>
              <Flex gap="2">
                <Input
                  value={newUser.tempPassword}
                  readOnly
                  fontFamily="mono"
                  bg="gray.50"
                  _dark={{ bg: "gray.700" }}
                />
                <IconButton
                  aria-label="Gerar nova senha"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={() =>
                    setNewUser((u) => ({ ...u, tempPassword: generatePassword() }))
                  }
                />
              </Flex>
              <Text fontSize="xs" color="gray.500" mt="1">
                Esta senha será enviada por e-mail ao usuário
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateUser}
              isDisabled={!newUser.name || !newUser.email}
            >
              Criar Usuário
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog: Editar Usuário */}
      <Modal isOpen={showEditDialog} onClose={() => setShowEditDialog(false)} isCentered>
        <ModalOverlay />
        <ModalContent bg="white" _dark={{ bg: "gray.800" }}>
          <ModalHeader>
            Editar Usuário
            <Text fontSize="sm" color="gray.500" fontWeight="normal" mt="1">
              Atualize os dados do usuário
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            {selectedUser && (
              <>
                <FormControl>
                  <FormLabel>Nome</FormLabel>
                  <Input value={selectedUser.name} readOnly bg="gray.50" _dark={{ bg: "gray.700" }} />
                </FormControl>
                <FormControl>
                  <FormLabel>E-mail</FormLabel>
                  <Input value={selectedUser.email} readOnly bg="gray.50" _dark={{ bg: "gray.700" }} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Perfil</FormLabel>
                <Select
                  value={selectedUser.profile}
                    onChange={(e) =>
                      setSelectedUser((u) => (u ? { ...u, profile: e.target.value as "citizen" | "manager" | "admin" } : null))
                  }
                >
                    <option value="citizen">Cidadão</option>
                    <option value="manager">Gestor</option>
                    <option value="admin">Administrador</option>
                </Select>
                </FormControl>

              {selectedUser.profile !== "citizen" && (
                  <FormControl isRequired>
                    <FormLabel>Órgão</FormLabel>
                  <Select
                    value={selectedUser.department || ""}
                      onChange={(e) =>
                        setSelectedUser((u) => (u ? { ...u, department: e.target.value } : null))
                    }
                      placeholder="Selecione o órgão"
                  >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                  </Select>
                  </FormControl>
              )}

              {selectedUser.profile === "manager" && (
                  <FormControl isRequired>
                    <FormLabel>Setor de Atuação</FormLabel>
                  <Select
                    value={selectedUser.sector || ""}
                      onChange={(e) =>
                        setSelectedUser((u) => (u ? { ...u, sector: e.target.value } : null))
                    }
                      placeholder="Selecione o setor"
                  >
                      {sectors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                  </Select>
                  </FormControl>
              )}

                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                <Select
                  value={selectedUser.status}
                    onChange={(e) =>
                      setSelectedUser((u) => (u ? { ...u, status: e.target.value as "active" | "inactive" } : null))
                  }
                >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                </Select>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleEditUser}>Salvar Alterações</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
