import { create } from 'zustand'
import { api } from '@/lib/api'

export interface User {
  id: string
  nome: string
  email: string
  perfil: string
  status: string
  criadoem: string
}

interface UsersState {
  usuarios: User[]
  loading: boolean
  error: string | null

  fetchUsuarios: () => Promise<void>

  criarUsuario: (payload: {
    name: string
    email: string
    password: string
    role: 'Cidadao' | 'Gestor'
  }) => Promise<void>

  alterarRole: (
    id: string,
    role: 'Cidadao' | 'Gestor'
  ) => Promise<void>

  ativarUsuario: (id: string) => Promise<void>

  desativarUsuario: (id: string) => Promise<void>
}

export const useUsersStore = create<UsersState>((set, get) => ({
  usuarios: [],
  loading: false,
  error: null,

  fetchUsuarios: async () => {
    set({
      loading: true,
      error: null,
    })

    try {
      const { data } = await api.get('/admin/users')

      set({
        usuarios: data.usuarios.map((user: any) => ({
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil,
          status: user.status,
          criadoem: user.criadoem,
        })),
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao carregar usuários',
      })
    }
  },

  criarUsuario: async ({
    name,
    email,
    password,
    role,
  }) => {
    try {
      await api.post('/admin/users', {
        name,
        email,
        password,
        role,
      })

      await get().fetchUsuarios()
    } catch (error) {
      throw error
    }
  },

  alterarRole: async (
    id,
    role
  ) => {
    try {
      await api.patch(`/admin/users/${id}/role`, {
        role,
      })

      await get().fetchUsuarios()
    } catch (error) {
      throw error
    }
  },

  ativarUsuario: async (id) => {
    try {
      await api.patch(
        `/admin/users/${id}/activate`
      )

      await get().fetchUsuarios()
    } catch (error) {
      throw error
    }
  },

  desativarUsuario: async (id) => {
    try {
      await api.patch(
        `/admin/users/${id}/deactivate`
      )

      await get().fetchUsuarios()
    } catch (error) {
      throw error
    }
  },
}))