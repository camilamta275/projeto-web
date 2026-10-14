/** @jest-environment node */

import { NextRequest } from 'next/server'
import { POST as loginPost } from '@/app/api/auth/login/route'
import {
  GET as ticketsGet,
  POST as ticketsPost,
} from '@/app/api/tickets/route'

describe('API de autenticação', () => {
  it('retorna 200 quando recebe email e senha', async () => {
    const request = new NextRequest(
      'http://localhost:3001/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'teste@example.com',
          password: '123456',
        }),
      },
    )

    const response = await loginPost(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.email).toBe('teste@example.com')
    expect(body.role).toBe('citizen')
  })

  it('retorna 401 quando as credenciais estão vazias', async () => {
    const request = new NextRequest(
      'http://localhost:3001/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      },
    )

    const response = await loginPost(request)

    expect(response.status).toBe(401)
  })
})

describe('API de chamados', () => {
  it('retorna uma lista de chamados', async () => {
    const request = new NextRequest(
      'http://localhost:3001/api/tickets',
    )

    const response = await ticketsGet(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('cria um chamado e retorna 201', async () => {
    const request = new NextRequest(
      'http://localhost:3001/api/tickets',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria: 'Problemas na Via',
          descricao: 'Buraco na rua próximo à escola',
          endereco: 'Rua de teste, 123',
          status: 'Aberto',
        }),
      },
    )

    const response = await ticketsPost(request)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.id).toBeDefined()
    expect(body.protocolo).toMatch(/^SCH-\d{4}-\d{4}$/)
    expect(body.descricao).toBe('Buraco na rua próximo à escola')
  })
})