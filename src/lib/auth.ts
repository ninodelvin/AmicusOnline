import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Auth attempt for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          // Find user in database using raw SQL
          const users = await prisma.$queryRaw`
            SELECT u.*, ur.role_name, ur.can_view_all_cases, ur.can_edit_all_cases, 
                   ur.can_delete_cases, ur.can_manage_users, ur.can_manage_lookups,
                   ur.can_assign_tasks, ur.can_view_reports
            FROM users u
            LEFT JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.email = ${credentials.email}
          ` as any[]

          const user = users[0]

          console.log('User found:', user ? 'Yes' : 'No')

          if (!user) {
            console.log('User not found in database')
            return null
          }

          // Check if account is locked
          if (user.account_locked_until && user.account_locked_until > new Date()) {
            console.log('Account is locked')
            throw new Error('Account is temporarily locked due to multiple failed login attempts')
          }

          // Check if account is active
          if (!user.is_active) {
            console.log('Account is not active')
            throw new Error('Account is deactivated')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
          console.log('Password valid:', isValidPassword)

          if (!isValidPassword) {
            // Increment failed login attempts
            const failedAttempts = user.failed_login_attempts + 1
            const shouldLock = failedAttempts >= 5
            
            await prisma.$executeRaw`
              UPDATE users 
              SET failed_login_attempts = ${failedAttempts}, 
                  account_locked_until = ${shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null}
              WHERE id = ${user.id}
            `

            if (shouldLock) {
              throw new Error('Account locked due to multiple failed login attempts')
            }

            return null
          }

          // Reset failed login attempts and update last login
          await prisma.$executeRaw`
            UPDATE users 
            SET failed_login_attempts = 0, account_locked_until = NULL, last_login = ${new Date()}
            WHERE id = ${user.id}
          `

          // Log successful login (simplified for now)
          try {
            await prisma.$executeRaw`
              INSERT INTO audit_logs (user_id, action, ip_address, created_at) 
              VALUES (${user.id}, 'LOGIN', 'unknown', ${new Date()})
            `
          } catch (auditError) {
            console.log('Audit log failed:', auditError)
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role_name,
            roleId: user.role_id.toString(),
            permissions: {
              canViewAllCases: user.can_view_all_cases === 1,
              canEditAllCases: user.can_edit_all_cases === 1,
              canDeleteCases: user.can_delete_cases === 1,
              canManageUsers: user.can_manage_users === 1,
              canManageLookups: user.can_manage_lookups === 1,
              canAssignTasks: user.can_assign_tasks === 1,
              canViewReports: user.can_view_reports === 1,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.roleId = user.roleId
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.roleId = token.roleId as string
        session.user.permissions = token.permissions as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
