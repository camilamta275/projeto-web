import { create } from 'zustand'
import type { Chamado, StatusChamado } from '@/types'

interface ChamadosState {
  chamados: Chamado[]
  chamadoAtual: Chamado | null
  filtros: {
    status?: StatusChamado
    orgao?: string
    busca?: string
  }
  loading: boolean
  error: string | null

  fetchChamados: () => Promise<void>
  fetchChamadoPorId: (id: string) => Promise<void>
  criarChamado: (dados: Partial<Chamado>) => Promise<Chamado>
  atualizarStatus: (id: string, status: StatusChamado) => Promise<void>
  setFiltros: (filtros: Partial<ChamadosState['filtros']>) => void
  setLoading: (loading: boolean) => void
}

export const useChamadosStore = create<ChamadosState>((set) => ({
  chamados: [],
  chamadoAtual: null,
  filtros: {},
  loading: false,
  error: null,

  fetchChamados: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('http://localhost:3001/chamados')
      if (!response.ok) {
        throw new Error('Erro ao buscar chamados')
      }
      const chamados = await response.json()
      set({ chamados, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },

  fetchChamadoPorId: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`http://localhost:3001/chamados/${id}`)
      if (!response.ok) {
        throw new Error('Chamado não encontrado')
      }
      const chamado = await response.json()
      set({ chamadoAtual: chamado, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },

  criarChamado: async (dados: Partial<Chamado>) => {
    set({ loading: true, error: null })
    try {
      let chamado: Chamado
      try {
        const response = await fetch('http://localhost:3001/chamados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
        })
        if (!response.ok) throw new Error('Servidor indisponível')
        chamado = await response.json()
      } catch {
        // Fallback local quando o JSON Server não está disponível
        chamado = {
          ...dados,
          id: String(Date.now()),
        } as Chamado
      }
      set((state) => ({
        chamados: [chamado, ...state.chamados],
        loading: false,
      }))
      return chamado
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
      throw error
    }
  },

  atualizarStatus: async (id: string, status: StatusChamado) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`http://localhost:3001/chamados/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, atualizadoEm: new Date().toISOString() }),
      })
      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }
      const chamado = await response.json()
      set((state) => ({
        chamados: state.chamados.map((c) => (c.id === id ? chamado : c)),
        chamadoAtual: state.chamadoAtual?.id === id ? chamado : state.chamadoAtual,
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },

  setFiltros: (filtros: Partial<ChamadosState['filtros']>) => {
    set((state) => ({
      filtros: { ...state.filtros, ...filtros },
    }))
  },

  setLoading: (loading: boolean) => {
    set({ loading })
  },
}))
