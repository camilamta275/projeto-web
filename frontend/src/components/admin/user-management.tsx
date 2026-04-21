"use client"

import { useState } from "react"
import { 
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  User,
  UserCheck,
  UserX
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface SystemUser {
  id: string
  name: string
  email: string
  profile: "citizen" | "manager" | "admin"
  department?: string
  sector?: string
  status: "active" | "inactive"
  createdAt: string
}

const mockUsers: SystemUser[] = [
  {
    id: "1",
    name: "Maria Costa",
    email: "maria.costa@pe.gov.br",
    profile: "manager",
    department: "Secretaria de Infraestrutura",
    sector: "Zona Norte",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao.silva@email.com",
    profile: "citizen",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Carlos Souza",
    email: "carlos.souza@pe.gov.br",
    profile: "admin",
    department: "TI - Governo",
    status: "active",
    createdAt: "2023-06-10",
  },
  {
    id: "4",
    name: "Ana Santos",
    email: "ana.santos@pe.gov.br",
    profile: "manager",
    department: "Compesa",
    sector: "Saneamento",
    status: "inactive",
    createdAt: "2023-09-05",
  },
  {
    id: "5",
    name: "Pedro Lima",
    email: "pedro.lima@email.com",
    profile: "citizen",
    status: "active",
    createdAt: "2024-03-12",
  },
]

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
  citizen: { label: "Cidadão", color: "bg-secondary text-secondary-foreground" },
  manager: { label: "Gestor", color: "bg-primary text-primary-foreground" },
  admin: { label: "Admin", color: "bg-status-critical text-status-critical-foreground" },
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
  const [users, setUsers] = useState<SystemUser[]>(mockUsers)
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
  const filteredUsers = users.filter((user) => {
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
    setUsers([user, ...users])
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
    setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)))
    setShowEditDialog(false)
    setSelectedUser(null)
  }

  const handleToggleStatus = (user: SystemUser) => {
    setUsers(
      users.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    )
  }

  const handleResetPassword = (user: SystemUser) => {
    // Simular envio de e-mail
    alert(`E-mail de redefinição de senha enviado para ${user.email}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button onClick={() => setShowNewUserDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterProfile} onValueChange={setFilterProfile}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Perfis</SelectItem>
                  <SelectItem value="citizen">Cidadão</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Órgão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Órgãos</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="hidden md:table-cell">Órgão</TableHead>
                <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={cn("font-normal", profileLabels[user.profile].color)}>
                      {profileLabels[user.profile].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {user.department || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === "active" ? "default" : "secondary"}
                      className={cn(
                        "font-normal",
                        user.status === "active"
                          ? "bg-status-completed text-status-completed-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditDialog(true)
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === "active" ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Reativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Redefinir Senha
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginação */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedUsers.length} de {filteredUsers.length} usuários
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog: Novo Usuário */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar uma nova conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select
                value={newUser.profile}
                onValueChange={(v: "citizen" | "manager" | "admin") =>
                  setNewUser((u) => ({ ...u, profile: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citizen">Cidadão</SelectItem>
                  <SelectItem value="manager">Gestor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newUser.profile !== "citizen" && (
              <div className="space-y-2">
                <Label>Órgão</Label>
                <Select
                  value={newUser.department}
                  onValueChange={(v) => setNewUser((u) => ({ ...u, department: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o órgão" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newUser.profile === "manager" && (
              <div className="space-y-2">
                <Label>Setor de Atuação</Label>
                <Select
                  value={newUser.sector}
                  onValueChange={(v) => setNewUser((u) => ({ ...u, sector: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Senha Temporária</Label>
              <div className="flex gap-2">
                <Input
                  value={newUser.tempPassword}
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setNewUser((u) => ({ ...u, tempPassword: generatePassword() }))
                  }
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta senha será enviada por e-mail ao usuário
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUser.name || !newUser.email}
            >
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Usuário */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={selectedUser.name} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={selectedUser.email} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select
                  value={selectedUser.profile}
                  onValueChange={(v: "citizen" | "manager" | "admin") =>
                    setSelectedUser((u) => (u ? { ...u, profile: v } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Cidadão</SelectItem>
                    <SelectItem value="manager">Gestor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedUser.profile !== "citizen" && (
                <div className="space-y-2">
                  <Label>Órgão</Label>
                  <Select
                    value={selectedUser.department || ""}
                    onValueChange={(v) =>
                      setSelectedUser((u) => (u ? { ...u, department: v } : null))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o órgão" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedUser.profile === "manager" && (
                <div className="space-y-2">
                  <Label>Setor de Atuação</Label>
                  <Select
                    value={selectedUser.sector || ""}
                    onValueChange={(v) =>
                      setSelectedUser((u) => (u ? { ...u, sector: v } : null))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(v: "active" | "inactive") =>
                    setSelectedUser((u) => (u ? { ...u, status: v } : null))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
