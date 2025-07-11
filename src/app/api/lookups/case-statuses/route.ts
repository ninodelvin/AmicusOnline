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
    const caseStatuses = await prisma.$queryRaw`
      SELECT id, status_name, description, is_active FROM case_statuses WHERE is_active = 1 ORDER BY status_name ASC
    `

    return NextResponse.json(caseStatuses)
  } catch (error) {
    console.error('Error fetching case statuses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
