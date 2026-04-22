import api from './api'
import type { Usuario } from '@/types'

export const usuariosService = {
  listar: async () => {
    const response = await api.get('/usuarios')
    return response.data
  },

  obterPorId: async (id: string) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  obterPorEmail: async (email: string) => {
    const response = await api.get('/usuarios', {
      params: { email },
    })
    return response.data
  },

  criar: async (dados: Partial<Usuario>) => {
    const response = await api.post('/usuarios', dados)
    return response.data
  },

  atualizar: async (id: string, dados: Partial<Usuario>) => {
    const response = await api.patch(`/usuarios/${id}`, dados)
    return response.data
  },

  deletar: async (id: string) => {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  },
}
