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
    const caseKinds = await prisma.$queryRaw`
      SELECT id, kind_name, description FROM case_kinds WHERE is_active = 1 ORDER BY kind_name ASC
    `

    return NextResponse.json(caseKinds)
  } catch (error) {
    console.error('Error fetching case kinds:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
