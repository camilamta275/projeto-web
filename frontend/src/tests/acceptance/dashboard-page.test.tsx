import { render } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    usuario: {
      perfil: 'Cidadão',
    },
    isLoading: false,
  }),
}))

describe('ATDD - Dashboard', () => {
  it('deve renderizar sem erros', () => {
    render(<DashboardPage />)
  })
})