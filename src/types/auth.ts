import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      roleId: string
      permissions: {
        canViewAllCases: boolean
        canEditAllCases: boolean
        canDeleteCases: boolean
        canManageUsers: boolean
        canManageLookups: boolean
        canAssignTasks: boolean
        canViewReports: boolean
      }
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    roleId: string
    permissions: {
      canViewAllCases: boolean
      canEditAllCases: boolean
      canDeleteCases: boolean
      canManageUsers: boolean
      canManageLookups: boolean
      canAssignTasks: boolean
      canViewReports: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    roleId: string
    permissions: {
      canViewAllCases: boolean
      canEditAllCases: boolean
      canDeleteCases: boolean
      canManageUsers: boolean
      canManageLookups: boolean
      canAssignTasks: boolean
      canViewReports: boolean
    }
  }
}

// Application-specific types
export interface UserPermissions {
  canViewAllCases: boolean
  canEditAllCases: boolean
  canDeleteCases: boolean
  canManageUsers: boolean
  canManageLookups: boolean
  canAssignTasks: boolean
  canViewReports: boolean
}

export interface CaseWithDetails {
  id: number
  case_number: string
  title: string
  description: string | null
  case_type: {
    id: number
    type_name: string
  }
  case_status: {
    id: number
    status_name: string
    color_code: string | null
  }
  priority_level: {
    id: number
    level_name: string
    color_code: string | null
  }
  created_by_user: {
    first_name: string
    last_name: string
  }
  created_at: Date
  updated_at: Date
  closed_at: Date | null
}

export interface DocumentWithDetails {
  id: number
  document_name: string
  document_type: {
    type_name: string
  }
  document_status: {
    status_name: string
    color_code: string | null
  }
  priority_level: {
    level_name: string
    color_code: string | null
  }
  created_by_user: {
    first_name: string
    last_name: string
  }
  created_at: Date
  file_size: number | null
  assigned_to: number | null
  due_date: Date | null
  completion_date: Date | null
  review_required: boolean
  review_completed: boolean
}
