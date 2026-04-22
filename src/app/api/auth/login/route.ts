import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    const { email, password } = await _request.json()

    // Simulação de login - em produção seria feito contra um banco de dados real
    if (email && password) {
      const user = {
        id: '1',
        email,
        name: 'Usuário Teste',
        role: 'citizen',
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
      }

      return NextResponse.json(user, { status: 200 })
    }

    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Auth endpoint' }, { status: 200 })
}

