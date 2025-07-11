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

    // Only show active users (exclude SuperAdmins from assignment list for security)
    const users = await prisma.user.findMany({
      where: {
        is_active: true,
        role: {
          role_name: {
            not: 'SuperAdmin' // Don't show SuperAdmins in assignment list
          }
        }
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: {
          select: {
            role_name: true
          }
        }
      },
      orderBy: [
        { first_name: 'asc' },
        { last_name: 'asc' }
      ]
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
