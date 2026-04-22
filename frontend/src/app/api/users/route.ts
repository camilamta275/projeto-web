import { NextRequest, NextResponse } from 'next/server'

const mockUsers = [
  {
    id: '1',
    email: 'cidadao@example.com',
    name: 'João Silva',
    phone: '(81) 98765-4321',
    role: 'Cidadão',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'inspetor@example.com',
    name: 'Maria Santos',
    phone: '(81) 99876-5432',
    role: 'Inspetor',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'gerente@example.com',
    name: 'Pedro Costa',
    phone: '(81) 97654-3210',
    role: 'Gestor',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json(mockUsers, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const data = await _request.json()
    const newUser = {
      id: `user_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    }
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

