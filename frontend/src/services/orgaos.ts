import api from './api'
import type { Orgao, RegraCompetencia } from '@/types'

export const orgaosService = {
  listar: async () => {
    const response = await api.get('/orgaos')
    return response.data
  },

  obterPorId: async (id: string) => {
    const response = await api.get(`/orgaos/${id}`)
    return response.data
  },

  criar: async (dados: Partial<Orgao>) => {
    const response = await api.post('/orgaos', dados)
    return response.data
  },

  atualizar: async (id: string, dados: Partial<Orgao>) => {
    const response = await api.patch(`/orgaos/${id}`, dados)
    return response.data
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/orgaos/${id}`)
    return response.data
  },
}

export const competenciasService = {
  listar: async () => {
    const response = await api.get('/regrasCompetencia')
    return response.data
  },

  obterPorCategoria: async (categoria: string) => {
    const response = await api.get('/regrasCompetencia', {
      params: { categoria },
    })
    return response.data
  },

  criar: async (dados: Partial<RegraCompetencia>) => {
    const response = await api.post('/regrasCompetencia', dados)
    return response.data
  },

  atualizar: async (id: string, dados: Partial<RegraCompetencia>) => {
    const response = await api.patch(`/regrasCompetencia/${id}`, dados)
    return response.data
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/regrasCompetencia/${id}`)
    return response.data
  },
}
