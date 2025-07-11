import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use raw SQL until Prisma client is fully regenerated
    const caseStages = await prisma.$queryRaw`
      SELECT id, stage_name, description, sort_order FROM case_stages WHERE is_active = 1 ORDER BY sort_order ASC
    `

    return NextResponse.json(caseStages)
  } catch (error) {
    console.error('Error fetching case stages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
