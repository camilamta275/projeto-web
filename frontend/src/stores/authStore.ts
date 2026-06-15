import { create } from 'zustand'
import type { Usuario } from '@/types'
import { api, ApiError } from '@/lib/api'

const MOCK_SESSION_KEY = 'fiscalize_mock_user'

const MOCK_USUARIOS: Usuario[] = [
  { id: '1', nome: 'João Silva', email: 'joao@example.com', perfil: 'Cidadão', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '3', nome: 'João da Silva Gestor', email: 'joao@prefeitura.gov.br', perfil: 'Gestor', orgaoId: '1', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '3b', nome: 'Pedro Gestor', email: 'pedro@pmr.pe.gov.br', perfil: 'Gestor', orgaoId: '1', status: 'Ativo', criadoEm: '2025-12-01T09:00:00Z' },
  { id: '4', nome: 'Ana Oliveira', email: 'ana@pmr.pe.gov.br', perfil: 'Gestor', orgaoId: '2', status: 'Ativo', criadoEm: '2025-11-15T08:30:00Z' },
  { id: '5', nome: 'Carlos Ferreira', email: 'carlos@compesa.pe.gov.br', perfil: 'Gestor', orgaoId: '3', status: 'Ativo', criadoEm: '2025-10-20T11:45:00Z' },
  { id: '6', nome: 'Admin Sistema', email: 'admin@recife.pe.gov.br', perfil: 'Admin', status: 'Ativo', criadoEm: '2025-09-01T00:00:00Z' },
]

const MOCK_PASSWORD = '123456'

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

function saveMockSession(usuario: Usuario) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(usuario))
  }
}

function loadMockSession(): Usuario | null {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem(MOCK_SESSION_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as Usuario
  } catch {
    return null
  }
}

function clearMockSession() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(MOCK_SESSION_KEY)
  }
}

let fetchMeGeneration = 0

function invalidateFetchMe() {
  fetchMeGeneration += 1
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
    invalidateFetchMe()
    set({ isLoading: true, error: null })
    try {
      // Tenta backend real primeiro (contas registradas)
      try {
        const { data } = await api.post('/auth/login', { email, senha })
        if (typeof window === 'undefined' || !data.token) {
          throw new ApiError('Servidor não retornou token de autenticação', 500)
        }
        localStorage.setItem('token', data.token)
        clearMockSession()
        set({
          usuario: mapUsuario(data),
          isAuthenticated: true,
          isLoading: false,
          sessionChecked: true,
        })
        return
      } catch {
        // Continua para usuários de teste (Gestor/Admin/Cidadão mock)
      }

      const mock = MOCK_USUARIOS.find((u) => u.email === email)
      if (!mock || senha !== MOCK_PASSWORD) {
        throw new ApiError('E-mail ou senha incorretos', 401)
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      saveMockSession(mock)
      set({
        usuario: mock,
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
    clearMockSession()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    try {
      await api.post('/auth/logout')
    } catch {
      // ignora — sessão mock ou token já inválido
    } finally {
      set({ usuario: null, isAuthenticated: false, error: null })
    }
  },

  fetchMe: async () => {
    const generation = ++fetchMeGeneration
    set({ isLoading: true })

    const mock = loadMockSession()
    const hasToken =
      typeof window !== 'undefined' && !!localStorage.getItem('token')

    if (!hasToken) {
      if (mock) {
        set({
          usuario: mock,
          isAuthenticated: true,
          isLoading: false,
          sessionChecked: true,
        })
        return
      }

      set({
        usuario: null,
        isAuthenticated: false,
        isLoading: false,
        sessionChecked: true,
      })
      return
    }

    try {
      const { data } = await api.get('/auth/me')
      if (generation !== fetchMeGeneration) return

      clearMockSession()
      set({
        usuario: mapUsuario(data),
        isAuthenticated: true,
        isLoading: false,
        sessionChecked: true,
      })
    } catch (error) {
      if (generation !== fetchMeGeneration) return

      if (error instanceof ApiError && error.statusCode === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      }

      if (mock) {
        set({
          usuario: mock,
          isAuthenticated: true,
          isLoading: false,
          sessionChecked: true,
        })
      } else {
        set({
          usuario: null,
          isAuthenticated: false,
          isLoading: false,
          sessionChecked: true,
        })
      }
    }
  },

  setUsuario: (usuario: Usuario | null) => {
    set({ usuario, isAuthenticated: usuario !== null })
  },
}))
