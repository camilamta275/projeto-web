/**
 * Enumerações para compatibilidade com validações Zod e componentes
 * Esses valores precisam estar em runtime para usar em z.nativeEnum()
 */

export const TicketCategoryEnum = {
  'Problemas na Via': 'Problemas na Via',
  'Água e Esgoto': 'Água e Esgoto',
  'Iluminação Pública': 'Iluminação Pública',
  'Saneamento Básico': 'Saneamento Básico',
  'Sinalização': 'Sinalização',
  'Outros Problemas': 'Outros Problemas',
} as const

export const TicketPriorityEnum = {
  'Baixa': 'Baixa',
  'Média': 'Média',
  'Alta': 'Alta',
  'Crítica': 'Crítica',
} as const

export enum UserRole {
  CITIZEN = 'Cidadão',
  MANAGER = 'Gestor',
  ADMIN = 'Admin',
  INSPECTOR = 'Fiscal',
}

export const UserRoleEnum = {
  'Cidadão': 'Cidadão',
  'Gestor': 'Gestor',
  'Admin': 'Admin',
  'Fiscal': 'Fiscal',
} as const

export const TicketStatusEnum = {
  'Aberto': 'Aberto',
  'Em Análise': 'Em Análise',
  'Em Andamento': 'Em Andamento',
  'Aguardando': 'Aguardando',
  'Resolvido': 'Resolvido',
  'Fechado': 'Fechado',
} as const

