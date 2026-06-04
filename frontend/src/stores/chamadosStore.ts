import { create } from 'zustand'
import type { Chamado, StatusChamado } from '@/types'
import { api } from '@/lib/api'
import dbData from '@/mocks/db.json'

export interface CreateDemandInput {
  title: string
  description: string
  category_id: number
  location: string
  latitude?: number
  longitude?: number
}

function mapChamado(data: any): Chamado {
  return {
    id: data.id,
    protocolo: data.protocolo,
    categoria: data.category?.nome ?? '',
    subcategoria: data.title ?? '',
    descricao: data.description ?? '',
    status: data.status as StatusChamado,
    prioridade: data.prioridade ?? 'Média',
    cidadaoId: data.creator?.id,
    orgaoId: data.category?.id ?? '',
    endereco: data.location ?? '',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    slaHoras: data.slahoras ?? 48,
    criadoEm: data.createdAt,
    atualizadoEm: data.updatedAt,
    timeline: (data.logs ?? []).map((log: any) => ({
      id: log.id ?? String(Math.random()),
      tipo: log.tipo,
      titulo: log.titulo,
      descricao: log.descricao,
      autor: log.autor,
      timestamp: log.timestamp,
    })),
  }
}

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
  criarChamado: (dados: CreateDemandInput) => Promise<Chamado>
  atualizarStatus: (id: string, status: StatusChamado) => Promise<void>
  setFiltros: (filtros: Partial<ChamadosState['filtros']>) => void
  setLoading: (loading: boolean) => void
}

export const useChamadosStore = create<ChamadosState>((set, get) => ({
  chamados: [],
  chamadoAtual: null,
  filtros: {},
  loading: false,
  error: null,

  fetchChamados: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/demands')
      set({ chamados: data.data.map(mapChamado), loading: false })
    } catch {
      set({ chamados: dbData.chamados as Chamado[], loading: false })
    }
  },

  fetchChamadoPorId: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/demands/${id}`)
      set({ chamadoAtual: mapChamado(data), loading: false })
    } catch {
      const local = get().chamados.find((c) => c.id === id)
      if (local) {
        set({ chamadoAtual: local, loading: false })
      } else {
        set({ error: 'Chamado não encontrado', loading: false })
      }
    }
  },

  criarChamado: async (dados: CreateDemandInput) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/demands', dados)
      const chamado = mapChamado(data)
      set((state) => ({ chamados: [chamado, ...state.chamados], loading: false }))
      return chamado
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro desconhecido', loading: false })
      throw error
    }
  },

  atualizarStatus: async (id: string, status: StatusChamado) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.put(`/demands/${id}`, { status })
      const chamado = mapChamado(data)
      set((state) => ({
        chamados: state.chamados.map((c) => (c.id === id ? chamado : c)),
        chamadoAtual: state.chamadoAtual?.id === id ? chamado : state.chamadoAtual,
        loading: false,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro desconhecido', loading: false })
    }
  },

  setFiltros: (filtros: Partial<ChamadosState['filtros']>) => {
    set((state) => ({ filtros: { ...state.filtros, ...filtros } }))
  },

  setLoading: (loading: boolean) => {
    set({ loading })
  },
}))

export const useTicketById = (id: string) =>
  useChamadosStore((state) => state.chamados.find((c) => c.id === id))

export const useAllTickets = () =>
  useChamadosStore((state) => state.chamados)

export const useAllOrgs = () => dbData.orgaos
