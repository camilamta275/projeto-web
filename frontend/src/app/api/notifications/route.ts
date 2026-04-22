import { NextRequest, NextResponse } from 'next/server'

const mockNotifications: any[] = []

export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json(mockNotifications, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const data = await _request.json()
    const newNotification = {
      id: `notif_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    }
    mockNotifications.push(newNotification)
    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 })
  }
}

