import type { TicketCategory, TicketPriority, TicketStatus } from '@/types'

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  'Problemas na Via': 'Problemas na Via',
  'Água e Esgoto': 'Água e Esgoto',
  'Iluminação Pública': 'Iluminação Pública',
  'Saneamento Básico': 'Saneamento Básico',
  'Sinalização': 'Sinalização',
  'Outros Problemas': 'Outros Problemas',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  'Baixa': 'Baixa',
  'Média': 'Média',
  'Alta': 'Alta',
  'Crítica': 'Crítica',
}

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  'Baixa': 'blue',
  'Média': 'yellow',
  'Alta': 'orange',
  'Crítica': 'red',
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  'Aberto': 'Aberto',
  'Em Análise': 'Em Análise',
  'Em Andamento': 'Em Andamento',
  'Aguardando': 'Aguardando',
  'Resolvido': 'Resolvido',
  'Fechado': 'Fechado',
}

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  'Aberto': 'gray',
  'Em Análise': 'yellow',
  'Em Andamento': 'blue',
  'Aguardando': 'orange',
  'Resolvido': 'green',
  'Fechado': 'gray',
}

export const PAGINATION_SIZE = 10

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  TICKETS: '/api/tickets',
  USERS: '/api/users',
  NOTIFICATIONS: '/api/notifications',
  REPORTS: '/api/reports',
  ANALYTICS: '/api/analytics',
} as const
