export type PerfilUsuario = 'Cidadão' | 'Gestor' | 'Admin'

export interface Usuario {
  id: string
  nome: string
  email: string
  cpf?: string
  perfil: PerfilUsuario
  orgaoId?: string
  status: 'Ativo' | 'Inativo'
  criadoEm: string
}
