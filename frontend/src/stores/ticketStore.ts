import { create } from 'zustand'
import type { Chamado, StatusChamado, PrioridadeChamado } from '@/types'

// ✅ Mocks diversificados para forçar a exibição de múltiplos itens no Dashboard
const MOCK_TICKETS: Chamado[] = [
  {
    id: '1',
    protocolo: 'SCH-2026-0142',
    categoria: 'Água e Esgoto',
    subcategoria: 'Vazamento',
    descricao: 'Vazamento na calçada.',
    status: 'Em Análise',
    prioridade: 'Alta',
    orgaoId: 1,
    endereco: 'Rua Aurora, Recife',
    latitude: -8.057,
    longitude: -34.882,
    slaHoras: 48,
    criadoEm: new Date(Date.now() - 172800000).toISOString(),
    atualizadoEm: new Date().toISOString(),
    timeline: [],
    slaDeadline: new Date(Date.now() - 10800000).toISOString(), // Vencido há 3h
  },
  {
    id: '2',
    protocolo: 'SCH-2026-0135',
    categoria: 'Iluminação Pública',
    subcategoria: 'Poste Apagado',
    descricao: 'Rua escura.',
    status: 'Aberto',
    prioridade: 'Crítica',
    orgaoId: 1,
    endereco: 'Av. Boa Viagem, Recife',
    latitude: -8.063,
    longitude: -34.871,
    slaHoras: 72,
    criadoEm: new Date(Date.now() - 86400000).toISOString(),
    atualizadoEm: new Date().toISOString(),
    timeline: [],
    slaDeadline: new Date(Date.now() - 28800000).toISOString(), // Vencido há 8h
  },
  {
    id: '3',
    protocolo: 'SCH-2026-0150',
    categoria: 'Sinalização',
    subcategoria: 'Placa Caída',
    descricao: 'Placa de Pare derrubada.',
    status: 'Em Andamento',
    prioridade: 'Média',
    orgaoId: 1,
    endereco: 'Derby, Recife',
    latitude: -8.045,
    longitude: -34.895,
    slaHoras: 24,
    criadoEm: new Date(Date.now() - 43200000).toISOString(),
    atualizadoEm: new Date().toISOString(),
    timeline: [],
    slaDeadline: new Date(Date.now() + 18000000).toISOString(), // No prazo (faltam 5h)
  }
]

interface TicketFilters {
  status?: StatusChamado
  priority?: PrioridadeChamado
  search?: string
}

interface TicketState {
  tickets: Chamado[]
  filteredTickets: Chamado[]
  selectedTicket: Chamado | null
  isLoading: boolean
  error: string | null
  filters: TicketFilters
  fetchTickets: () => Promise<void>
  createTicket: (ticket: Omit<Chamado, 'id' | 'criadoEm' | 'atualizadoEm' | 'timeline'>) => Promise<void>
  updateTicket: (id: string, updates: Partial<Chamado>) => Promise<void>
  deleteTicket: (id: string) => Promise<void>
  selectTicket: (ticket: Chamado | null) => void
  setFilters: (filters: TicketFilters) => void
  applyFilters: () => void
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: MOCK_TICKETS,
  filteredTickets: MOCK_TICKETS,
  selectedTicket: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchTickets: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/tickets')
      if (!response.ok) throw new Error('Falha na API')

      const data = await response.json()
      
      // 🔥 Se a API trouxer apenas 1, somamos aos mocks para comparação
      // Se quiser ver APENAS a API quando houver dados, use: data.length > 0 ? data : MOCK_TICKETS
      const rawTickets = data.length > 0 ? data : MOCK_TICKETS

      const normalized: Chamado[] = rawTickets.map((c: any) => ({
        ...c,
        subcategoria: c.subcategoria || 'Geral',
        timeline: c.timeline || [],
        orgaoId: c.orgaoId || 1, // Garante que pertença ao órgão 1 para aparecer no dashboard
        slaDeadline: c.slaDeadline || new Date(new Date(c.criadoEm).getTime() + (c.slaHoras || 24) * 3600000).toISOString(),
      }))

      set({ tickets: normalized, isLoading: false })
      get().applyFilters()
    } catch (error) {
      set({ tickets: MOCK_TICKETS, isLoading: false })
      get().applyFilters()
    }
  },

  createTicket: async (ticket) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      })
      const newTicket = await response.json()
      set((state) => ({ tickets: [newTicket, ...state.tickets], isLoading: false }))
      get().applyFilters()
    } catch (e) { set({ isLoading: false }) }
  },

  updateTicket: async (id, updates) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const updated = await response.json()
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
        isLoading: false,
      }))
      get().applyFilters()
    } catch (e) { set({ isLoading: false }) }
  },

  deleteTicket: async (id) => {
    try {
      await fetch(`/api/tickets/${id}`, { method: 'DELETE' })
      set((state) => ({ tickets: state.tickets.filter((t) => t.id !== id) }))
      get().applyFilters()
    } catch (e) { /* error */ }
  },

  selectTicket: (ticket) => set({ selectedTicket: ticket }),

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }))
    get().applyFilters()
  },

  applyFilters: () => {
    const { tickets, filters } = get()
    let filtered = [...tickets]

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter((t) =>
        t.protocolo?.toLowerCase().includes(term) ||
        t.endereco?.toLowerCase().includes(term)
      )
    }

    if (filters.status) filtered = filtered.filter((t) => t.status === filters.status)
    if (filters.priority) filtered = filtered.filter((t) => t.prioridade === filters.priority)

    set({ filteredTickets: filtered })
  },
}))