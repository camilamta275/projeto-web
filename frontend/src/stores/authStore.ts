import { create } from 'zustand'
import type { Usuario } from '@/types'
import { api } from '@/lib/api'

const MOCK_USUARIOS: Usuario[] = [
  { id: '3', nome: 'João da Silva Gestor', email: 'joao@prefeitura.gov.br', perfil: 'Gestor', orgaoId: '1', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '3b', nome: 'Pedro Gestor', email: 'pedro@pmr.pe.gov.br', perfil: 'Gestor', orgaoId: '1', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '4', nome: 'Ana Oliveira', email: 'ana@pmr.pe.gov.br', perfil: 'Gestor', orgaoId: '2', status: 'Ativo', criadoEm: '2025-11-15T08:30:00Z' },
  { id: '5', nome: 'Carlos Ferreira', email: 'carlos@compesa.pe.gov.br', perfil: 'Gestor', orgaoId: '3', status: 'Ativo', criadoEm: '2025-10-20T11:45:00Z' },
  { id: '6', nome: 'Admin Sistema', email: 'admin@recife.pe.gov.br', perfil: 'Admin', status: 'Ativo', criadoEm: '2025-09-01T00:00:00Z' },
]

function mapUsuario(data: any): Usuario {
  const perfilMap: Record<string, 'Cidadão' | 'Gestor' | 'Admin'> = {
    Cidadao: 'Cidadão',
    Gestor: 'Gestor',
    Admin: 'Admin',
  }
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    perfil: perfilMap[data.perfil] ?? data.perfil,
    status: data.status ?? 'Ativo',
    criadoEm: data.criadoem ?? data.criadoEm ?? new Date().toISOString(),
  }
}

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  register: (nome: string, email: string, senha: string) => Promise<void>
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setUsuario: (usuario: Usuario | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (nome: string, email: string, senha: string) => {
    set({ isLoading: true, error: null })
    try {
      await api.post('/auth/register', { nome, email, senha })
      set({ isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  login: async (email: string, senha: string) => {
    set({ isLoading: true, error: null })
    try {
      // Try real backend first (Cidadao)
      try {
        const { data } = await api.post('/auth/login', { email, senha })
        set({ usuario: mapUsuario(data), isAuthenticated: true, isLoading: false })
        return
      } catch {
        // Fall through to mock for Gestor/Admin
      }

      // Fallback: mock users for Gestor and Admin
      const mock = MOCK_USUARIOS.find((u) => u.email === email)
      if (!mock || senha !== '123456') {
        throw new Error('E-mail ou senha incorretos')
      }
      set({ usuario: mock, isAuthenticated: true, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login'
      set({ usuario: null, isAuthenticated: false, error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      set({ usuario: null, isAuthenticated: false, error: null })
    }
  },

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/auth/me')
      set({ usuario: mapUsuario(data), isAuthenticated: true, isLoading: false })
    } catch {
      set({ usuario: null, isAuthenticated: false, isLoading: false })
    }
  },

  setUsuario: (usuario: Usuario | null) => {
    set({ usuario })
  },
}))
