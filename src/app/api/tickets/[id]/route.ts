import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados em memória (em produção seria um banco real)
const mockTickets: any = {
  '1': {
    id: '1',
    title: 'Buraco na Rua Ferreira Borges',
    description: 'Grande buraco na pista que oferece risco aos ciclistas',
    category: 'pothole',
    priority: 'high',
    status: 'in_progress',
    reporterId: '1',
    assignedTo: '2',
    location: {
      latitude: -8.047562,
      longitude: -34.877036,
      address: 'Rua Ferreira Borges, 100, Recife, PE',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
  },
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = mockTickets[params.id]
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
    }
    return NextResponse.json(ticket, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar ticket' }, { status: 500 })
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await _request.json()
    if (!mockTickets[params.id]) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
    }
    const updatedTicket = {
      ...mockTickets[params.id],
      ...data,
      updatedAt: new Date(),
    }
    mockTickets[params.id] = updatedTicket
    return NextResponse.json(updatedTicket, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar ticket' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mockTickets[params.id]) {
      return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
    }
    delete mockTickets[params.id]
    return NextResponse.json({}, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar ticket' }, { status: 500 })
  }
}
