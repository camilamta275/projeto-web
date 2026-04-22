"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, MoreHorizontal, Building2, Clock, Power } from "lucide-react"
import {
  Box,
  Flex,
  Button,
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
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text
} from "@chakra-ui/react"
import {useAppStore} from "../../store/useAppStore"

export interface RoutingRule {
  id: string
  category: string
  responsibleOrg: string
  slaPadrao: number
  active: boolean
}

const orgaos = [
  "Compesa",
  "Celpe",
  "Emlurb",
  "CTTU",
  "Prefeitura",
  "Secretaria de Saúde",
  "Defesa Civil",
]

const categories = [
  "Vazamento de Água",
  "Buraco na Via",
  "Iluminação Pública",
  "Lixo Acumulado",
  "Semáforo com Defeito",
  "Árvore Caída",
  "Esgoto a Céu Aberto",
  "Calçada Danificada",
  "Poluição Sonora",
  "Dengue/Foco de Mosquito",
]

export function CompetencyMatrix() {
  // Integração com Store Global
  const routingRules = useAppStore((state) => state.routingRules) || []
  const addRoutingRule = useAppStore((state) => state.addRoutingRule)
  const updateRoutingRule = useAppStore((state) => state.updateRoutingRule)
  const deleteRoutingRule = useAppStore((state) => state.deleteRoutingRule)
  const toggleRoutingRuleActive = useAppStore((state) => state.toggleRoutingRuleActive)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)
  const [formData, setFormData] = useState({
    category: "",
    responsibleOrg: "",
    slaPadrao: 24,
    active: true,
  })

  const handleOpenDialog = (rule?: RoutingRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        category: rule.category,
        responsibleOrg: rule.responsibleOrg,
        slaPadrao: rule.slaPadrao,
        active: rule.active,
      })
    } else {
      setEditingRule(null)
      setFormData({
        category: "",
        responsibleOrg: "",
        slaPadrao: 24,
        active: true,
      })
    }
    onOpen()
  }

  const handleSave = () => {
    if (editingRule) {
      if (updateRoutingRule) {
        updateRoutingRule(editingRule.id, formData)
      }
    } else {
      if (addRoutingRule) {
        addRoutingRule({ id: Date.now().toString(), ...formData })
      }
    }
    onClose()
  }

  const handleDelete = (id: string) => {
    if (deleteRoutingRule) deleteRoutingRule(id)
  }

  const handleToggleActive = (id: string) => {
    if (toggleRoutingRuleActive) {
      toggleRoutingRuleActive(id)
    }
  }

  const formatSLA = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) return `${days}d`
    return `${days}d ${remainingHours}h`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="tracking-tight">Matriz de Competências</CardTitle>
            <CardDescription>
              Configure as regras de roteamento automático de chamados
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="tracking-tight">
                  {editingRule ? "Editar Regra" : "Nova Regra de Roteamento"}
                </DialogTitle>
                <DialogDescription>
                  Configure a categoria, órgão responsável e tempo de SLA.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria do Problema</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="org">Órgão Responsável</Label>
                  <Select
                    value={formData.responsibleOrg}
                    onValueChange={(value) => setFormData({ ...formData, responsibleOrg: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o órgão" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgaos.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sla">SLA Padrão (em horas)</Label>
                  <Input
                    id="sla"
                    type="number"
                    min="1"
                    value={formData.slaPadrao}
                    onChange={(e) => setFormData({ ...formData, slaPadrao: parseInt(e.target.value) || 24 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Equivale a {formatSLA(formData.slaPadrao)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active">Regra Ativa</Label>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingRule ? "Salvar Alterações" : "Criar Regra"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Categoria do Problema</TableHead>
                <TableHead>Órgão Responsável</TableHead>
                <TableHead className="text-center">SLA Padrão</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className={!rule.active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{rule.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {rule.responsibleOrg}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{formatSLA(rule.slaPadrao)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={rule.active ? "default" : "secondary"}
                      className={rule.active ? "bg-status-completed text-status-completed-foreground" : ""}
                    >
                      {rule.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(rule)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(rule.id)}>
                          <Power className="mr-2 h-4 w-4" />
                          {rule.active ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
