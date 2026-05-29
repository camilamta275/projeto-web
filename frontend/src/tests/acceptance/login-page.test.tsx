import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

describe('ATDD - Login', () => {
  it('deve renderizar a tela de login', () => {
    render(<LoginPage />)

    expect(screen.getByText(/entrar/i)).toBeInTheDocument()
  })
})