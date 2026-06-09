import { create } from 'zustand'
import type { Usuario } from '@/types'
import { api, ApiError } from '@/lib/api'

function mapUsuario(data: Record<string, unknown>): Usuario {
  const perfilMap: Record<string, 'Cidadão' | 'Gestor' | 'Admin'> = {
    Cidadao: 'Cidadão',
    Cidadão: 'Cidadão',
    citizen: 'Cidadão',
    Gestor: 'Gestor',
    gestor: 'Gestor',
    Admin: 'Admin',
    admin: 'Admin',
  }
  const rawPerfil = (data.perfil ?? data.role ?? 'Cidadao') as string
  const criadoEm =
    (data.criadoem as string) ??
    (data.criadoEm as string) ??
    (data.created_at as string) ??
    new Date().toISOString()

  return {
    id: String(data.id),
    nome: String(data.nome ?? data.name ?? ''),
    email: String(data.email ?? ''),
    perfil: perfilMap[rawPerfil] ?? 'Cidadão',
    status: (data.status as 'Ativo' | 'Inativo') ?? 'Ativo',
    criadoEm,
  }
}

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionChecked: boolean
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
  sessionChecked: false,
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
      const { data } = await api.post('/auth/login', { email, senha })
      set({
        usuario: mapUsuario(data),
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
      })
    } catch (error) {
      const message =
        error instanceof ApiError && error.statusCode === 401
          ? 'E-mail ou senha incorretos'
          : error instanceof Error
            ? error.message
            : 'Erro ao fazer login'
      set({ usuario: null, isAuthenticated: false, error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // 401 or network errors — still clear local session
    } finally {
      set({ usuario: null, isAuthenticated: false, error: null })
    }
  },

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/auth/me')
      set({
        usuario: mapUsuario(data),
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
      })
    } catch {
      set({
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
        sessionChecked: true,
      })
    }
  },

  setUsuario: (usuario: Usuario | null) => {
    set({ usuario, isAuthenticated: usuario !== null })
  },
}))
