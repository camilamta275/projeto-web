import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const analytics = {
      totalTickets: 150,
      openTickets: 25,
      inProgressTickets: 45,
      resolvedTickets: 80,
      averageResolutionTime: 24,
      satisfactionRate: 85,
      ticketsByCategory: {
        pothole: 45,
        broken_sign: 20,
        tree_issue: 15,
        sanitation: 30,
        lighting: 25,
        park_maintenance: 10,
        other: 5,
      },
      ticketsByStatus: {
        open: 25,
        in_progress: 45,
        resolved: 80,
        closed: 0,
        rejected: 0,
      },
    }
    return NextResponse.json(analytics, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar análises' }, { status: 500 })
  }
}
