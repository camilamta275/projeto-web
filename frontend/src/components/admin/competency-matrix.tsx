"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, MoreHorizontal, Building2, Clock, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RoutingRule {
  id: string
  category: string
  responsibleOrg: string
  slaPadrao: number
  active: boolean
}

const initialRules: RoutingRule[] = [
  { id: "1", category: "Vazamento de Água", responsibleOrg: "Compesa", slaPadrao: 24, active: true },
  { id: "2", category: "Buraco na Via", responsibleOrg: "Emlurb", slaPadrao: 72, active: true },
  { id: "3", category: "Iluminação Pública", responsibleOrg: "Celpe", slaPadrao: 48, active: true },
  { id: "4", category: "Lixo Acumulado", responsibleOrg: "Emlurb", slaPadrao: 24, active: true },
  { id: "5", category: "Semáforo com Defeito", responsibleOrg: "CTTU", slaPadrao: 12, active: true },
  { id: "6", category: "Árvore Caída", responsibleOrg: "Emlurb", slaPadrao: 6, active: true },
  { id: "7", category: "Esgoto a Céu Aberto", responsibleOrg: "Compesa", slaPadrao: 24, active: false },
  { id: "8", category: "Calçada Danificada", responsibleOrg: "Prefeitura", slaPadrao: 168, active: true },
]

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
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingRule) {
      setRules(rules.map(r => 
        r.id === editingRule.id 
          ? { ...r, ...formData }
          : r
      ))
    } else {
      const newRule: RoutingRule = {
        id: Date.now().toString(),
        ...formData,
      }
      setRules([...rules, newRule])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setRules(rules.map(r => 
      r.id === id ? { ...r, active: !r.active } : r
    ))
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
