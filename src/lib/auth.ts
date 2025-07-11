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
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { role: true }
          })

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
            
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failed_login_attempts: failedAttempts,
                account_locked_until: shouldLock 
                  ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
                  : null
              }
            })

            if (shouldLock) {
              throw new Error('Account locked due to multiple failed login attempts')
            }

            return null
          }

          // Reset failed login attempts and update last login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failed_login_attempts: 0,
              account_locked_until: null,
              last_login: new Date()
            }
          })

          // Log successful login
          await prisma.auditLog.create({
            data: {
              user_id: user.id,
              action: 'LOGIN',
              ip_address: '', // Will be populated from request headers
              created_at: new Date()
            }
          })

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role.role_name,
            roleId: user.role_id.toString(),
            permissions: {
              canViewAllCases: user.role.can_view_all_cases,
              canEditAllCases: user.role.can_edit_all_cases,
              canDeleteCases: user.role.can_delete_cases,
              canManageUsers: user.role.can_manage_users,
              canManageLookups: user.role.can_manage_lookups,
              canAssignTasks: user.role.can_assign_tasks,
              canViewReports: user.role.can_view_reports,
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
