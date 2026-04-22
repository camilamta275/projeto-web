import { create } from 'zustand'

export interface Notificacao {
  id: string
  usuarioId: string
  titulo: string
  mensagem: string
  tipo: 'chamado' | 'status' | 'sistema'
  lida: boolean
  criadoEm: string
  chamadoId?: string
}

interface NotificacoesState {
  notificacoes: Notificacao[]
  naoLidas: number
  fetchNotificacoes: (usuarioId: string) => Promise<void>
  marcarComoLida: (id: string) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  adicionarNotificacao: (notificacao: Notificacao) => void
  removerNotificacao: (id: string) => void
}

export const useNotificacoesStore = create<NotificacoesState>((set) => ({
  notificacoes: [],
  naoLidas: 0,

  fetchNotificacoes: async (usuarioId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/notificacoes?usuarioId=${usuarioId}`
      )
      if (!response.ok) {
        throw new Error('Erro ao buscar notificações')
      }
      const notificacoes = await response.json()
      const naoLidas = notificacoes.filter((n: Notificacao) => !n.lida).length
      set({ notificacoes, naoLidas })
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    }
  },

  marcarComoLida: async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/notificacoes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lida: true }),
      })
      if (!response.ok) {
        throw new Error('Erro ao marcar como lida')
      }
      set((state) => ({
        notificacoes: state.notificacoes.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        ),
        naoLidas: Math.max(0, state.naoLidas - 1),
      }))
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  },

  marcarTodasComoLidas: async () => {
    set((state) => ({
      notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
      naoLidas: 0,
    }))
  },

  adicionarNotificacao: (notificacao: Notificacao) => {
    set((state) => ({
      notificacoes: [notificacao, ...state.notificacoes],
      naoLidas: state.naoLidas + 1,
    }))
  },

  removerNotificacao: (id: string) => {
    set((state) => ({
      notificacoes: state.notificacoes.filter((n) => n.id !== id),
    }))
  },
}))

export { useNotificacoesStore as useNotificationStore }
