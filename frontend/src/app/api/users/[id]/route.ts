import { NextRequest, NextResponse } from 'next/server'

const mockUsers: any = {
  '1': {
    id: '1',
    email: 'cidadao@example.com',
    name: 'João Silva',
    phone: '(81) 98765-4321',
    role: 'citizen',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = mockUsers[params.id]
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 })
  }
}
