import { create } from 'zustand'
import type { Ticket, TicketStatus, TicketPriority } from '@/types'

interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  searchTerm?: string
}

interface TicketState {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  isLoading: boolean
  error: string | null
  filters: TicketFilters
  fetchTickets: () => Promise<void>
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>
  deleteTicket: (id: string) => Promise<void>
  selectTicket: (ticket: Ticket | null) => void
  setFilters: (filters: TicketFilters) => void
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  selectedTicket: null,
  isLoading: false,
  error: null,
  filters: {},
  fetchTickets: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/tickets')
      if (!response.ok) {
        throw new Error('Falha ao buscar tickets')
      }
      const tickets = await response.json()
      set({ tickets, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false,
      })
    }
  },
  createTicket: async (ticket) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      })
      if (!response.ok) {
        throw new Error('Falha ao criar ticket')
      }
      const newTicket = await response.json()
      set((state) => ({
        tickets: [newTicket, ...state.tickets],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false,
      })
    }
  },
  updateTicket: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error('Falha ao atualizar ticket')
      }
      const updatedTicket = await response.json()
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updatedTicket : t)),
        selectedTicket:
          state.selectedTicket?.id === id ? updatedTicket : state.selectedTicket,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false,
      })
    }
  },
  deleteTicket: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Falha ao deletar ticket')
      }
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        selectedTicket: state.selectedTicket?.id === id ? null : state.selectedTicket,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        isLoading: false,
      })
    }
  },
  selectTicket: (ticket) => {
    set({ selectedTicket: ticket })
  },
  setFilters: (filters) => {
    set({ filters })
  },
}))
