import { create } from 'zustand'

export interface Notificacao {
  id: string
  usuarioId: string
  titulo: string
  mensagem: string
  tipo: 'chamado' | 'status' | 'equipe' | 'concluido' | 'chamado-registrado' | 'status-atualizado' | 'equipe-designada' | 'chamado-concluido'
  lida: boolean
  criadoEm: string
  chamadoId?: string
}

interface NotificacoesStore {
  notificacoes: Notificacao[]
  loading: boolean
  fetchNotificacoes: (usuarioId: string) => Promise<void>
  marcarComoLida: (id: string) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  addNotificacao: (notificacao: Notificacao) => void
}

/**
 * Zustand store para gerenciar notificações do cidadão
 */
export const useNotificacoesStore = create<NotificacoesStore>((set, get) => ({
  notificacoes: [],
  loading: false,

  fetchNotificacoes: async (usuarioId: string) => {
    set({ loading: true })
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notificacoes?usuarioId=${usuarioId}`
      )
      if (response.ok) {
        const data = await response.json()
        set({ notificacoes: data })
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      set({ loading: false })
    }
  },

  marcarComoLida: async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notificacoes/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lida: true }),
        }
      )
      if (response.ok) {
        const notificacoes = get().notificacoes.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        )
        set({ notificacoes })
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  },

  marcarTodasComoLidas: async () => {
    try {
      const store = get()
      const updatePromises = store.notificacoes
        .filter((n) => !n.lida)
        .map((n) =>
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notificacoes/${n.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lida: true }),
            }
          )
        )

      await Promise.all(updatePromises)

      const notificacoes = store.notificacoes.map((n) => ({ ...n, lida: true }))
      set({ notificacoes })
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
    }
  },

  addNotificacao: (notificacao: Notificacao) => {
    set((state) => ({
      notificacoes: [notificacao, ...state.notificacoes],
    }))
  },
}))
