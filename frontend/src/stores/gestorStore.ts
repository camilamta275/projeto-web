import { create } from 'zustand'
import type { Chamado } from '@/types'

interface DashboardMetricas {
  totalChamados: number
  chamadosAbertos: number
  chamadosCriticos: number
  slaVencido: number
  tempoMedioResolucao: number
  satisfacao: number
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
      // Aqui você buscaria as métricas da API
      // Por enquanto, valores simulados
      const metricas: DashboardMetricas = {
        totalChamados: 156,
        chamadosAbertos: 24,
        chamadosCriticos: 3,
        slaVencido: 5,
        tempoMedioResolucao: 18,
        satisfacao: 87,
      }
      set({ metricas, loading: false })
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
        `http://localhost:3001/chamados?orgaoId=${orgaoId}&status=Aberto`
      )
      if (!response.ok) {
        throw new Error('Erro ao buscar fila')
      }
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
      const response = await fetch(`http://localhost:3001/chamados/${chamadoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gestorId,
          status: 'Em Análise',
          atualizadoEm: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error('Erro ao atribuir chamado')
      }
      set((state) => ({
        chamadosFila: state.chamadosFila.filter((c) => c.id !== chamadoId),
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },

  transferirChamado: async (chamadoId: string, orgaoId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`http://localhost:3001/chamados/${chamadoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgaoId,
          status: 'Em Análise',
          atualizadoEm: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error('Erro ao transferir chamado')
      }
      set((state) => ({
        chamadosFila: state.chamadosFila.filter((c) => c.id !== chamadoId),
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      })
    }
  },
}))
