import type { CategoriaChamado } from './chamado'

export interface Orgao {
  id: string
  nome: string
  sigla: string
  tipo: 'Municipal' | 'Estadual' | 'Concessionária'
  slaHoras: number
  responsavel: string
  email: string
  status: 'Ativo' | 'Inativo'
  categorias: CategoriaChamado[]
}

export interface RegraCompetencia {
  id: string
  categoria: CategoriaChamado
  subcategoria: string
  orgaoPrincipalId: string
  orgaoSecundarioId?: string
  slaHoras: number
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
}
