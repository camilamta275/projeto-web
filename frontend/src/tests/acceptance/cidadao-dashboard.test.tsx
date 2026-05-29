import { render, screen } from '@testing-library/react'
import CidadaoDashboard from '@/app/cidadao/chamados/page'

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    usuario: {
      nome: 'Maria',
    },
  }),
}))

jest.mock('@/stores/chamadosStore', () => ({
  useChamadosStore: () => ({
    loading: false,
    fetchChamados: jest.fn(),
    chamados: [
      {
        id: 1,
        protocolo: 'REC-001',
        endereco: 'Rua A',
        status: 'Aberto',
        prioridade: 'Alta',
        criadoEm: new Date().toISOString(),
      },
    ],
  }),
}))

describe('ATDD - Chamados do cidadão', () => {
  it('deve exibir chamados na tela', () => {
    render(<CidadaoDashboard />)

    expect(screen.getByText(/meus chamados/i)).toBeInTheDocument()

    expect(screen.getByText(/REC-001/i)).toBeInTheDocument()
  })
})