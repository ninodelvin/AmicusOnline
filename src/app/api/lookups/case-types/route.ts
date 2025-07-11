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
    const caseTypes = await prisma.$queryRaw`
      SELECT id, type_name, description, is_active FROM case_types WHERE is_active = 1 ORDER BY type_name ASC
    `

    return NextResponse.json(caseTypes)
  } catch (error) {
    console.error('Error fetching case types:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
