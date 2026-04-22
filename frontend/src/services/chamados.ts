import api from './api'
import type { Chamado } from '@/types'

export const chamadosService = {
  listar: async (filtros?: Record<string, any>) => {
    const response = await api.get('/chamados', { params: filtros })
    return response.data
  },

  obterPorId: async (id: string) => {
    const response = await api.get(`/chamados/${id}`)
    return response.data
  },

  criar: async (dados: Partial<Chamado>) => {
    const response = await api.post('/chamados', dados)
    return response.data
  },

  atualizar: async (id: string, dados: Partial<Chamado>) => {
    const response = await api.patch(`/chamados/${id}`, dados)
    return response.data
  },

  atualizarStatus: async (id: string, status: string) => {
    const response = await api.patch(`/chamados/${id}`, {
      status,
      atualizadoEm: new Date().toISOString(),
    })
    return response.data
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/chamados/${id}`)
    return response.data
  },
}
