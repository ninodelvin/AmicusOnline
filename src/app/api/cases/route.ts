import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/cases - List cases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const userRole = session.user.role

    let cases
    
    // SuperAdmins and Admins can see all cases
    if (userRole === 'SuperAdmin' || userRole === 'Admin') {
      cases = await prisma.case.findMany({
        include: {
          case_type: true,
          case_status: true,
          priority_level: true,
          created_by_user: {
            select: {
              first_name: true,
              last_name: true,
            }
          },
          case_assignments: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })
    } else {
      // Attorneys and Paralegals only see assigned cases
      cases = await prisma.case.findMany({
        where: {
          case_assignments: {
            some: {
              user_id: userId,
              is_active: true
            }
          }
        },
        include: {
          case_type: true,
          case_status: true,
          priority_level: true,
          created_by_user: {
            select: {
              first_name: true,
              last_name: true,
            }
          },
          case_assignments: {
            include: {
              user: {
                select: {
                  first_name: true,
                  last_name: true,
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      })
    }

    return NextResponse.json(cases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cases - Create new case
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, case_type_id, case_status_id, priority_level_id, assigned_users } = body

    // Validate required fields
    if (!title || !case_type_id || !case_status_id || !priority_level_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    // Generate case number (simple format: CASE-YYYYMMDD-XXX)
    const today = new Date()
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0')
    
    // Count cases created today to generate sequence number
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const todayCases = await prisma.case.count({
      where: {
        created_at: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const sequenceNumber = (todayCases + 1).toString().padStart(3, '0')
    const caseNumber = `CASE-${dateStr}-${sequenceNumber}`

    // Create the case
    const newCase = await prisma.case.create({
      data: {
        case_number: caseNumber,
        title,
        description: description || null,
        case_type_id: parseInt(case_type_id),
        case_status_id: parseInt(case_status_id),
        priority_level_id: parseInt(priority_level_id),
        created_by: userId,
      },
      include: {
        case_type: true,
        case_status: true,
        priority_level: true,
        created_by_user: {
          select: {
            first_name: true,
            last_name: true,
          }
        }
      }
    })

    // Create case assignments if users are assigned
    if (assigned_users && assigned_users.length > 0) {
      await prisma.caseAssignment.createMany({
        data: assigned_users.map((assignedUserId: number) => ({
          case_id: newCase.id,
          user_id: assignedUserId,
          assigned_by: userId,
        }))
      })
    }

    // Log the creation
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action: 'CREATE_CASE',
        table_name: 'cases',
        record_id: newCase.id,
        new_values: {
          case_number: newCase.case_number,
          title: newCase.title,
          case_type_id: newCase.case_type_id,
          case_status_id: newCase.case_status_id,
          priority_level_id: newCase.priority_level_id
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
