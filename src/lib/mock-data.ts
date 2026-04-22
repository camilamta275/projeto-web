import type { Chamado } from '@/types'

export const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  'Problemas na Via': { label: 'Problemas na Via', emoji: '🛣️' },
  'Água e Esgoto': { label: 'Água e Esgoto', emoji: '💧' },
  'Iluminação Pública': { label: 'Iluminação Pública', emoji: '💡' },
  'Saneamento Básico': { label: 'Saneamento Básico', emoji: '🚮' },
  'Sinalização': { label: 'Sinalização', emoji: '🚦' },
  'Outros Problemas': { label: 'Outros Problemas', emoji: '📋' },
}

export const PRIORITY_LABELS: Record<string, string> = {
  Baixa: 'Baixa',
  Média: 'Média',
  Alta: 'Alta',
  Crítica: 'Crítica',
}

export const STATUS_LABELS: Record<string, string> = {
  Aberto: 'Aberto',
  'Em Análise': 'Em Análise',
  'Em Andamento': 'Em Andamento',
  Aguardando: 'Aguardando',
  Resolvido: 'Resolvido',
  Fechado: 'Fechado',
}

export function getSlaInfo(ticket: Chamado): { label: string; expired: boolean } {
  const expired = typeof ticket.slaEncerradoHa === 'number' && ticket.slaEncerradoHa < 0
  if (expired) {
    return { label: `Vencido há ${Math.abs(ticket.slaEncerradoHa!)}h`, expired: true }
  }
  if (typeof ticket.slaEncerradoHa === 'number') {
    return { label: `${ticket.slaEncerradoHa}h restantes`, expired: false }
  }
  return { label: `${ticket.slaHoras}h prazo total`, expired: false }
}
