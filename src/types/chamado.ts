export type StatusChamado = 'Aberto' | 'Em Análise' | 'Em Andamento' | 'Aguardando' | 'Resolvido' | 'Fechado'
export type PrioridadeChamado = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type CategoriaChamado = 'Problemas na Via' | 'Água e Esgoto' | 'Iluminação Pública' | 'Saneamento Básico' | 'Sinalização' | 'Outros Problemas'

export interface TimelineEvent {
  id: string
  tipo: 'criacao' | 'status' | 'mensagem' | 'transferencia' | 'conclusao'
  titulo?: string
  descricao: string
  autor?: string
  usuario?: string
  data?: string
  timestamp?: string
}

export interface Chamado {
  id: string
  protocolo: string // formato SCH-2026-0001
  categoria: CategoriaChamado | string
  subcategoria: string
  descricao: string
  status: StatusChamado
  prioridade: PrioridadeChamado
  cidadaoId?: string
  usuarioId?: string
  orgaoId: number | string
  gestorId?: string
  endereco: string
  latitude: number
  longitude: number
  fotoUrl?: string
  foto?: string
  slaHoras: number
  slaEncerradoHa?: number // horas vencido
  criadoEm: string // ISO date
  atualizadoEm: string
  timeline: TimelineEvent[]
  atribuído?: boolean
  slaJustification?: string
  resolutionNote?: string
  resolutionPhotoUrl?: string
}
