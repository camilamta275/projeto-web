import { NextRequest, NextResponse } from 'next/server'
import { Ticket } from '@/types'

// Simulação de banco de dados em memória
let tickets: Ticket[] = [
  {
    id: '1',
    protocolo: 'SCH-2026-0001',
    categoria: 'Problemas na Via',
    subcategoria: 'Buraco',
    descricao: 'Grande buraco na pista que oferece risco aos ciclistas',
    status: 'Em Andamento',
    prioridade: 'Alta',
    orgaoId: '1',
    endereco: 'Rua Ferreira Borges, 100, Recife, PE',
    latitude: -8.047562,
    longitude: -34.877036,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    slaHoras: 24,
    timeline: [],
  },
]

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json(tickets, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar tickets' }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const data = await _request.json()
    const newTicket: Ticket = {
      id: 'ticket_' + Date.now().toString(),
      protocolo: 'SCH-2026-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      timeline: [],
      ...data,
    }
    tickets.push(newTicket)
    return NextResponse.json(newTicket, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar ticket' }, { status: 500 })
  }
}
