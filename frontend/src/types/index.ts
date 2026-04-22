import type { StatusChamado, PrioridadeChamado, CategoriaChamado, Chamado } from './chamado'
import type { Usuario } from './usuario'

export * from './chamado'
export * from './usuario'
export * from './orgao'
export * from './enums'

// Type aliases for compatibility with English-named imports
export type TicketStatus = StatusChamado
export type TicketPriority = PrioridadeChamado
export type TicketCategory = CategoriaChamado
export { UserRole } from './enums'
export type Ticket = Chamado
export type User = Usuario

