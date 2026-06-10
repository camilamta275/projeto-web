import { create } from 'zustand'
import type { Chamado } from '@/types'
import { api } from '@/lib/api'
import { MOCK_API_BASE_URL } from '@/utils/constants'

interface CategoriaDemanda {
  category: string
  total: number
  percentage: number
}

interface DashboardMetricas {
  totalChamados: number
  chamadosAbertos: number
  chamadosEmProgresso: number
  chamadosEncerrados: number
  demandasPorCategoria: CategoriaDemanda[]
  tempoMedioResolucao: number | null
  totalDemandasConsideradas: number
}

interface GestorState {
  metricas: DashboardMetricas | null
  chamadosFila: Chamado[]
  loading: boolean
  error: string | null

  fetchMetricas: (orgaoId: string) => Promise<void>
  fetchFilaChamados: (orgaoId: string) => Promise<void>
  atribuirChamado: (chamadoId: string, gestorId: string) => Promise<void>
  transferirChamado: (chamadoId: string, orgaoId: string) => Promise<void>
}

export const useGestorStore = create<GestorState>((set) => ({
  metricas: null,
  chamadosFila: [],
  loading: false,
  error: null,

  fetchMetricas: async (_orgaoId: string) => {
    set({ loading: true, error: null })
    try {
      const [dashboardRes, categoriaRes, tempoRes] = await Promise.all([
        api.get('/gestor/dashboard'),
        api.get('/metrics/demands-by-category'),
        api.get('/metrics/average-response-time'),
      ])

      const { chamados } = dashboardRes.data

      set({
        metricas: {
          totalChamados: chamados.total,
          chamadosAbertos: chamados.abertos,
          chamadosEmProgresso: chamados.emProgresso,
          chamadosEncerrados: chamados.encerrados,
          demandasPorCategoria: categoriaRes.data.data,
          tempoMedioResolucao: tempoRes.data.media_horas,
          totalDemandasConsideradas: tempoRes.data.total_demandas_consideradas,
        },
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },

  fetchFilaChamados: async (orgaoId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(
        `${MOCK_API_BASE_URL}/chamados?orgaoId=${orgaoId}&status=Aberto`
      )
      if (!response.ok) throw new Error('Erro ao buscar fila')
      const chamados = await response.json()
      set({ chamadosFila: chamados, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },

  atribuirChamado: async (chamadoId: string, gestorId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${MOCK_API_BASE_URL}/chamados/${chamadoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gestorId, status: 'Em Análise', atualizadoEm: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error('Erro ao atribuir chamado')
      set((state) => ({ chamadosFila: state.chamadosFila.filter((c) => c.id !== chamadoId), loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro desconhecido', loading: false })
    }
  },

  transferirChamado: async (chamadoId: string, orgaoId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${MOCK_API_BASE_URL}/chamados/${chamadoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgaoId, status: 'Em Análise', atualizadoEm: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error('Erro ao transferir chamado')
      set((state) => ({ chamadosFila: state.chamadosFila.filter((c) => c.id !== chamadoId), loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro desconhecido', loading: false })
    }
  },
}))
