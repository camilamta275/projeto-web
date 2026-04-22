import { create } from 'zustand'
import type { Usuario } from '@/types'

// Usuários mock para fallback quando o JSON Server não estiver disponível
const MOCK_USUARIOS: Usuario[] = [
  { id: '1', nome: 'João Silva', email: 'joao@example.com', perfil: 'Cidadão', status: 'Ativo', criadoEm: '2026-01-15T10:30:00Z' },
  { id: '2', nome: 'Maria Santos', email: 'maria@example.com', perfil: 'Cidadão', status: 'Ativo', criadoEm: '2026-02-10T14:20:00Z' },
  { id: '3', nome: 'João da Silva Gestor', email: 'joao@prefeitura.gov.br', perfil: 'Gestor', orgaoId: '1', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '3b', nome: 'João da Silva Gestor', email: 'pedro@pmr.pe.gov.br', perfil: 'Gestor', orgaoId: '1', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '4', nome: 'Ana Oliveira', email: 'ana@pmr.pe.gov.br', perfil: 'Gestor', orgaoId: '2', status: 'Ativo', criadoEm: '2025-11-15T08:30:00Z' },
  { id: '5', nome: 'Carlos Ferreira', email: 'carlos@compesa.pe.gov.br', perfil: 'Gestor', orgaoId: '3', status: 'Ativo', criadoEm: '2025-10-20T11:45:00Z' },
  { id: '6', nome: 'Admin Sistema', email: 'admin@recife.pe.gov.br', perfil: 'Admin', status: 'Ativo', criadoEm: '2025-09-01T00:00:00Z' },
]

interface AuthState {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  setUsuario: (usuario: Usuario | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, _senha: string) => {
    set({ isLoading: true, error: null })
    try {
      // Tenta o JSON Server primeiro, cai no mock se falhar
      let usuario: Usuario | null = null
      try {
        const response = await fetch('http://localhost:3001/usuarios?email=' + encodeURIComponent(email))
        if (response.ok) {
          const usuarios = await response.json()
          usuario = usuarios[0] ?? null
        }
      } catch {
        // JSON Server indisponível — usa dados mock locais
        usuario = MOCK_USUARIOS.find((u) => u.email === email) ?? null
      }

      if (!usuario) {
        // Tenta no mock mesmo que o servidor tenha respondido sem resultado
        usuario = MOCK_USUARIOS.find((u) => u.email === email) ?? null
      }

      if (!usuario) {
        throw new Error('Usuário não encontrado. Use um dos emails de teste.')
      }

      set({
        usuario,
        token: 'mock-token-' + usuario.id,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      set({
        usuario: null,
        token: null,
        isAuthenticated: false,
        error: message,
        isLoading: false,
      })
      throw new Error(message)
    }
  },

  logout: () => {
    set({
      usuario: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setUsuario: (usuario: Usuario | null) => {
    set({ usuario })
  },
}))
