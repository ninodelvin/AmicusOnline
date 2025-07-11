# AmicusOnline Case Management System Setup Guide

## Enterprise-Grade Architecture Overview

This case management system is designed for nationwide deployment with:

- **User Authentication & Role-Based Access Control**
- **Case Assignment System** (users only see their assigned cases)
- **Normalized Database Fields** with dropdown validation
- **Enterprise-Grade Database** (PostgreSQL recommended for nationwide scale)
- **UI Template Integration** capability
- **Scalable Architecture** for high-volume usage

## Prerequisites Installation

### 1. Install Node.js
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the installer (this includes npm and npx)
4. Restart VS Code after installation

### 2. Fix PowerShell Execution Policy (Windows)
If you get a "scripts is disabled" error, run this in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Verify Installation
After installing Node.js, open a new terminal in VS Code and run:
```bash
node --version
npm --version
npx --version
```

## Next Steps (After Node.js Installation)

### 1. Create Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

### 2. Install Enterprise Dependencies
```bash
npm install @prisma/client prisma
npm install next-auth
npm install @types/bcryptjs bcryptjs
npm install zod
npm install react-hook-form @hookform/resolvers
npm install lucide-react
npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog
npm install multer @types/multer
npm install sharp
npm install aws-sdk @aws-sdk/client-s3
npm install nodemailer @types/nodemailer
npm install jsonwebtoken @types/jsonwebtoken
```

### 3. Database Setup (PostgreSQL Recommended)
- Set up PostgreSQL database
- Configure Prisma ORM for database management
- Create user authentication system
- Implement role-based access control

## Enterprise Features to Implement

### Database Schema
- **Users Table**: ID, email, password, role_id, department, first_name, last_name, is_active, created_at, updated_at, password_reset_token, password_reset_expires, last_login, failed_login_attempts, locked_until
- **Roles Table**: ID, role_name, permissions (JSON), description
- **Cases Table**: ID, title, description, status_id, priority_id, type_id, client_id, created_by, created_at, updated_at
- **Case_Assignments Table**: ID, case_id, user_id, case_role_id, assigned_by, assigned_at, is_primary, is_active
- **Case_Roles Table**: ID, role_name, description, permissions (e.g., "Lead Attorney", "Prosecution", "Defense", "Witness", "Expert", "Paralegal")
- **Clients Table**: ID, name, email, phone, address, created_at
- **Case_Status Table**: ID, status_name (dropdown normalization)
- **Case_Priority Table**: ID, priority_name (dropdown normalization)
- **Case_Types Table**: ID, type_name (dropdown normalization)
- **Documents Table**: ID, case_id, filename, original_name, file_path, file_size, mime_type, uploaded_by, uploaded_at, version, is_active, assigned_to, document_status_id, assigned_by, assigned_at, due_date, priority_level, notes
- **Document_Categories Table**: ID, category_name, description (e.g., "Legal Brief", "Evidence", "Contract")
- **Document_Status Table**: ID, status_name, description (e.g., "Pending Review", "In Progress", "Completed", "Rejected")
- **Document_Tags Table**: ID, document_id, tag_name (for search and organization)
- **Document_Versions Table**: ID, document_id, version_number, file_path, uploaded_by, uploaded_at, change_notes
- **Document_Access_Log Table**: ID, document_id, user_id, action (view, download, edit), timestamp
- **Tasks Table**: ID, case_id, assigned_to, title, description, due_date, completed

### Security Features
- JWT-based authentication
- Role-based permissions (SuperAdmin, Admin, Manager, Attorney, Paralegal, etc.)
- Case assignment restrictions
- Audit logging
- Data encryption

### User Roles & Permissions

#### SuperAdmin
- **Access**: All cases in the system + **System Configuration**
- **Permissions**: 
  - View, create, edit, delete all cases
  - Upload and download all documents
  - Manage all users and roles
  - Access system administration
  - View all audit logs and reports
  - Configure system settings
  - **EXCLUSIVE ACCESS**: Manage lookup/dropdown items
    - Case Status (Open, Closed, Pending, etc.)
    - Case Priority (High, Medium, Low, etc.)
    - Case Types (Criminal, Civil, Family, etc.)
    - Document Categories (Legal Brief, Evidence, Contract, etc.)
    - Case Roles (Prosecution, Defense, Expert Witness, etc.)
  - **Database Management**: Add/edit/delete dropdown values
  - **System Integrity**: Only SuperAdmins can modify reference data

#### Admin
- **Access**: Limited administrative functions
- **Permissions**:
  - Create new cases
  - Create new users (within their department)
  - View cases in their department
  - Assign users to cases
  - **Cannot modify lookup/dropdown items**
  - **Cannot edit system configurations**

#### Manager/Senior Attorney
- **Access**: Cases assigned to them + cases of team members
- **Permissions**:
  - View, edit assigned cases and team cases
  - Upload and download documents in accessible cases
  - Assign cases to team members
  - View team performance reports

#### Attorney/Paralegal (Regular Users)
- **Access**: Only cases specifically assigned to them
- **Permissions**:
  - View and edit only assigned cases
  - Upload and download documents in assigned cases only
  - Update case status and add notes
  - Cannot reassign cases
  - Limited reporting (own cases only)

#### Read-Only User
- **Access**: Cases assigned for viewing only
- **Permissions**:
  - View assigned cases (read-only)
  - Download documents (if granted)
  - Cannot edit or upload
  - Cannot reassign cases

### Access Control Implementation

#### Case Access Logic
```typescript
// Example access control logic
function canAccessCase(user: User, case: Case): boolean {
  // SuperAdmin can access everything
  if (user.role.name === 'SuperAdmin') return true;
  
  // Admin can access cases in their department
  if (user.role.name === 'Admin' && case.department === user.department) return true;
  
  // Manager can access assigned cases + team member cases
  if (user.role.name === 'Manager') {
    return case.assigned_user_id === user.id || 
           case.assigned_user.reports_to === user.id;
  }
  
  // Regular users can only access assigned cases
  return case.assigned_user_id === user.id;
}
```

#### Document Access Logic
```typescript
function canAccessDocument(user: User, document: Document): boolean {
  // First check if user can access the case
  if (!canAccessCase(user, document.case)) return false;
  
  // Additional document-specific permissions
  const permissions = user.role.permissions;
  
  return {
    canView: permissions.includes('view_documents'),
    canDownload: permissions.includes('download_documents'),
    canUpload: permissions.includes('upload_documents'),
    canDelete: permissions.includes('delete_documents') && 
               (user.role.name === 'SuperAdmin' || document.uploaded_by === user.id)
  };
}
```

#### Database Seed Data for Roles
```typescript
const defaultSystemRoles = [
  {
    name: 'SuperAdmin',
    permissions: ['all_access', 'system_admin', 'user_management', 'view_all_cases', 'edit_all_cases', 'upload_documents', 'download_documents', 'delete_documents', 'manage_lookups', 'manage_case_status', 'manage_case_priority', 'manage_case_types', 'manage_document_categories', 'manage_case_roles']
  },
  {
    name: 'Admin', 
    permissions: ['create_cases', 'create_users_dept', 'view_dept_cases', 'assign_cases_dept', 'manage_users_dept']
    // NOTE: NO access to lookup/dropdown management
  },
  {
    name: 'Manager',
    permissions: ['team_access', 'view_assigned_cases', 'view_team_cases', 'edit_assigned_cases', 'upload_documents', 'download_documents', 'assign_team_cases']
  },
  {
    name: 'Attorney',
    permissions: ['view_assigned_cases', 'edit_assigned_cases', 'upload_documents', 'download_documents', 'update_case_status']
  },
  {
    name: 'Paralegal',
    permissions: ['view_assigned_cases', 'edit_assigned_cases', 'upload_documents', 'download_documents', 'update_case_notes']
  },
  {
    name: 'ReadOnly',
    permissions: ['view_assigned_cases', 'download_documents']
  }
];

const defaultCaseRoles = [
  {
    role_name: 'Lead Attorney',
    description: 'Primary legal counsel with full case responsibility',
    permissions: ['full_access', 'upload_documents', 'download_documents', 'edit_case', 'assign_tasks']
  },
  {
    role_name: 'Associate Attorney', 
    description: 'Supporting legal counsel',
    permissions: ['limited_access', 'upload_documents', 'download_documents', 'edit_case']
  },
  {
    role_name: 'Prosecution',
    description: 'Government/plaintiff legal team',
    permissions: ['prosecution_access', 'upload_documents', 'download_documents', 'edit_case']
  },
  {
    role_name: 'Defense',
    description: 'Defendant legal representation',
    permissions: ['defense_access', 'upload_documents', 'download_documents', 'edit_case']
  },
  {
    role_name: 'Paralegal',
    description: 'Legal assistant supporting attorneys',
    permissions: ['limited_access', 'upload_documents', 'download_documents', 'update_notes']
  },
  {
    role_name: 'Expert Witness',
    description: 'Subject matter expert providing testimony',
    permissions: ['expert_access', 'upload_reports', 'download_relevant_docs', 'read_only_case']
  },
  {
    role_name: 'Fact Witness',
    description: 'Individual with relevant testimony',
    permissions: ['witness_access', 'read_only_case', 'download_relevant_docs']
  },
  {
    role_name: 'Investigator',
    description: 'Case research and fact-finding professional',
    permissions: ['investigator_access', 'upload_evidence', 'download_documents', 'update_notes']
  },
  {
    role_name: 'Client Representative',
    description: 'Clients designated contact person',
    permissions: ['client_access', 'read_only_case', 'download_reports']
  },
  {
    role_name: 'Opposing Counsel',
    description: 'Legal representation for opposing party',
    permissions: ['opposing_access', 'download_shared_docs', 'upload_shared_docs']
  }
];
```

### Performance Considerations
- Database indexing for large-scale queries
- Caching strategy (Redis recommended)
- Load balancing preparation
- CDN for document storage
- API rate limiting

## UI Template Integration Plan
- Analyze purchased template structure
- Map template components to case management features
- Integrate with existing Tailwind CSS setup
- Customize for case management workflows

## Document Management Features

### Document Upload & Storage
- **Multi-file upload** with drag-and-drop interface
- **File type validation** (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, etc.)
- **File size limits** (configurable per user role)
- **Virus scanning** integration for security
- **Cloud storage** (AWS S3, Azure Blob, or local storage)
- **Document thumbnails** and previews

### Document Organization
- **Categorization** by document type (Legal Brief, Evidence, Contract, etc.)
- **Tagging system** for easy search and filtering
- **Folder structure** within each case
- **Version control** with change tracking
- **Document linking** between related cases

### Document Security & Access
- **Role-based access control** (who can view/edit/delete)
- **Document encryption** at rest and in transit
- **Access logging** (who accessed what and when)
- **Digital signatures** and watermarking
- **Retention policies** and automatic archiving

### Document Search & Retrieval
- **Full-text search** within document content
- **Advanced filtering** by date, type, author, tags
- **OCR capability** for scanned documents
- **Global search** across all accessible cases
- **Recent documents** and favorites

### Document Workflow
- **Check-in/check-out** system for editing
- **Approval workflows** for sensitive documents
- **Document templates** for common case types
- **Automated document generation** from case data
- **Email integration** for document sharing

### Case Assignment System with Role-Specific Access

#### Legal Case Roles
Each user assigned to a case has a specific role that determines their access and responsibilities:

##### Case Role Types
- **Lead Attorney**: Primary legal counsel, full case access
- **Associate Attorney**: Supporting counsel, case access based on assignment
- **Prosecution**: Government/plaintiff legal team
- **Defense**: Defendant legal team  
- **Paralegal**: Legal assistant supporting attorneys
- **Expert Witness**: Subject matter experts
- **Fact Witness**: Individuals with relevant testimony
- **Court Reporter**: Transcription and recording
- **Investigator**: Case research and fact-finding
- **Client Representative**: Client's designated contact
- **Opposing Counsel**: Legal representation for other parties
- **Mediator/Arbitrator**: Dispute resolution professionals

#### Case Assignment Logic
```typescript
interface CaseAssignment {
  id: string;
  case_id: string;
  user_id: string;
  case_role_id: string;
  assigned_by: string;
  assigned_at: Date;
  is_primary: boolean;
  is_active: boolean;
  access_level: 'full' | 'limited' | 'read_only';
  can_upload_documents: boolean;
  can_download_documents: boolean;
  can_edit_case: boolean;
}

// Example: Get all users assigned to a case with their roles
function getCaseTeam(caseId: string) {
  return db.query(`
    SELECT 
      u.first_name, u.last_name, u.email,
      cr.role_name, cr.description,
      ca.is_primary, ca.access_level,
      ca.can_upload_documents, ca.can_download_documents
    FROM case_assignments ca
    JOIN users u ON ca.user_id = u.id
    JOIN case_roles cr ON ca.case_role_id = cr.id
    WHERE ca.case_id = ? AND ca.is_active = true
    ORDER BY ca.is_primary DESC, cr.role_name
  `, [caseId]);
}
```

#### Role-Based Document Access
```typescript
function getDocumentAccess(userId: string, caseId: string, documentId: string) {
  const assignment = getCaseAssignment(userId, caseId);
  
  if (!assignment) return { access: false };
  
  const baseAccess = {
    canView: true,
    canDownload: assignment.can_download_documents,
    canUpload: assignment.can_upload_documents,
    canEdit: assignment.can_edit_case && assignment.access_level !== 'read_only'
  };
  
  // Role-specific restrictions
  switch (assignment.case_role.role_name) {
    case 'Opposing Counsel':
      return { 
        ...baseAccess, 
        canView: false, // Can only see documents shared explicitly
        canDownload: false 
      };
    case 'Expert Witness':
      return { 
        ...baseAccess, 
        canUpload: true, // Can upload expert reports
        canView: true   // Can view relevant case materials
      };
    case 'Client Representative':
      return { 
        ...baseAccess, 
        canEdit: false, // Read-only access to case updates
        canUpload: false 
      };
    default:
      return baseAccess;
  }
}
```

### Lookup/Dropdown Data Management

#### SuperAdmin Exclusive Access
Only SuperAdmins can manage the normalized lookup data that ensures data consistency across the system:

##### Lookup Tables Managed by SuperAdmins Only:
- **Case_Status Table**: Open, Closed, Pending, In Review, Archived, etc.
- **Case_Priority Table**: Critical, High, Medium, Low, etc.
- **Case_Types Table**: Criminal, Civil, Family, Corporate, Immigration, etc.
- **Document_Categories Table**: Legal Brief, Evidence, Contract, Correspondence, etc.
- **Case_Roles Table**: Prosecution, Defense, Expert Witness, Paralegal, etc.

#### Access Control for Lookup Management
```typescript
function canManageLookups(user: User): boolean {
  return user.role.name === 'SuperAdmin';
}

function canCreateCase(user: User): boolean {
  return ['SuperAdmin', 'Admin'].includes(user.role.name);
}

function canCreateUser(user: User): boolean {
  return ['SuperAdmin', 'Admin'].includes(user.role.name);
}

// Example: Admin trying to create a case
function createCase(user: User, caseData: any) {
  if (!canCreateCase(user)) {
    throw new Error('Insufficient permissions to create case');
  }
  
  // Admin can only use existing dropdown values
  // Cannot modify Case_Status, Case_Priority, Case_Types
  const validStatuses = getCaseStatuses(); // Read-only for Admin
  const validPriorities = getCasePriorities(); // Read-only for Admin
  const validTypes = getCaseTypes(); // Read-only for Admin
  
  // Validate that selected values exist in lookup tables
  if (!validStatuses.find(s => s.id === caseData.status_id)) {
    throw new Error('Invalid case status');
  }
  
  // Proceed with case creation using existing lookup values
  return createCaseRecord(caseData);
}
```

#### Lookup Management UI (SuperAdmin Only)
```typescript
// Example component structure for SuperAdmin lookup management
const LookupManagement = ({ user }: { user: User }) => {
  if (!canManageLookups(user)) {
    return <div>Access Denied: SuperAdmin required</div>;
  }
  
  return (
    <div className="lookup-management">
      <h2>System Configuration - Lookup Tables</h2>
      
      <Section title="Case Status Management">
        <LookupEditor table="case_status" />
      </Section>
      
      <Section title="Case Priority Management">
        <LookupEditor table="case_priority" />
      </Section>
      
      <Section title="Case Types Management">
        <LookupEditor table="case_types" />
      </Section>
      
      <Section title="Document Categories Management">
        <LookupEditor table="document_categories" />
      </Section>
      
      <Section title="Case Roles Management">
        <LookupEditor table="case_roles" />
      </Section>
    </div>
  );
};
```

## Authentication & Password Management

### Password Reset System
Enterprise-grade password reset functionality with security features:

#### Password Reset Database Fields
- **password_reset_token**: Secure token for password reset (hashed)
- **password_reset_expires**: Token expiration timestamp (15-30 minutes)
- **last_login**: Track user login activity
- **failed_login_attempts**: Counter for failed login attempts
- **locked_until**: Account lockout timestamp for security

#### Password Reset Flow
```typescript
// 1. User requests password reset
async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists for security
    return { success: true, message: "If email exists, reset link sent" };
  }
  
  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 12);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  
  // Save to database
  await updateUser(user.id, {
    password_reset_token: hashedToken,
    password_reset_expires: expiresAt
  });
  
  // Send email with reset link
  await sendPasswordResetEmail(user.email, resetToken);
  
  return { success: true, message: "Password reset link sent to email" };
}

// 2. User clicks reset link and submits new password
async function resetPassword(token: string, newPassword: string) {
  const users = await getUsersWithValidResetTokens();
  
  // Find user with matching token
  let validUser = null;
  for (const user of users) {
    const isValidToken = await bcrypt.compare(token, user.password_reset_token);
    if (isValidToken && new Date() < user.password_reset_expires) {
      validUser = user;
      break;
    }
  }
  
  if (!validUser) {
    throw new Error('Invalid or expired reset token');
  }
  
  // Validate new password strength
  validatePasswordStrength(newPassword);
  
  // Hash new password and clear reset token
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await updateUser(validUser.id, {
    password: hashedPassword,
    password_reset_token: null,
    password_reset_expires: null,
    failed_login_attempts: 0,
    locked_until: null
  });
  
  // Log password change for audit
  await logPasswordChange(validUser.id, 'password_reset');
  
  return { success: true, message: "Password successfully reset" };
}
```

#### Account Lockout Protection
```typescript
async function handleFailedLogin(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return;
  
  const failedAttempts = (user.failed_login_attempts || 0) + 1;
  const maxAttempts = 5;
  const lockoutDuration = 30 * 60 * 1000; // 30 minutes
  
  let updateData: any = {
    failed_login_attempts: failedAttempts,
    last_login_attempt: new Date()
  };
  
  // Lock account after max failed attempts
  if (failedAttempts >= maxAttempts) {
    updateData.locked_until = new Date(Date.now() + lockoutDuration);
    
    // Notify admin of potential security breach
    await notifyAdminAccountLocked(user.email);
  }
  
  await updateUser(user.id, updateData);
}

async function handleSuccessfulLogin(userId: string) {
  await updateUser(userId, {
    failed_login_attempts: 0,
    locked_until: null,
    last_login: new Date()
  });
}
```

#### Email Templates
```typescript
// Password reset email template
const passwordResetEmailTemplate = (resetUrl: string, userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>AmicusOnline Password Reset</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <h2>Password Reset Request</h2>
    <p>Hello ${userName},</p>
    
    <p>You have requested to reset your password for your AmicusOnline account.</p>
    
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    
    <p><strong>This link will expire in 30 minutes.</strong></p>
    
    <p>If you did not request this password reset, please ignore this email and contact your system administrator.</p>
    
    <p>For security reasons, never share this link with anyone.</p>
    
    <hr>
    <p><small>AmicusOnline Case Management System</small></p>
  </div>
</body>
</html>
`;

// Account locked notification
const accountLockedEmailTemplate = (userName: string, unlockTime: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>AmicusOnline Account Locked</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <h2>Account Security Alert</h2>
    <p>Hello ${userName},</p>
    
    <p>Your AmicusOnline account has been temporarily locked due to multiple failed login attempts.</p>
    
    <p><strong>Account will be unlocked at: ${unlockTime}</strong></p>
    
    <p>If this was not you, please contact your system administrator immediately.</p>
    
    <p>For additional security, consider:</p>
    <ul>
      <li>Using a strong, unique password</li>
      <li>Enabling two-factor authentication</li>
      <li>Checking your account for unauthorized access</li>
    </ul>
    
    <hr>
    <p><small>AmicusOnline Case Management System</small></p>
  </div>
</body>
</html>
`;
```

#### Password Policy Enforcement
```typescript
function validatePasswordStrength(password: string): void {
  const minLength = 8;
  const maxLength = 128;
  
  if (password.length < minLength) {
    throw new Error(`Password must be at least ${minLength} characters long`);
  }
  
  if (password.length > maxLength) {
    throw new Error(`Password must be no more than ${maxLength} characters long`);
  }
  
  // Require at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  
  // Require at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  
  // Require at least one number
  if (!/\d/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
  
  // Require at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    throw new Error('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    throw new Error('Password is too common, please choose a stronger password');
  }
}
```

## Document Tasking & Workflow Management

#### Document Assignment Fields (SuperAdmin/Admin Only)
Enhanced document management with workflow capabilities for courtroom staff:

##### Document Tasking Fields
- **assigned_to**: User ID of staff member assigned to process the document
- **document_status_id**: Current processing status (Pending Review, In Progress, Completed, etc.)
- **assigned_by**: User ID who made the assignment (audit trail)
- **assigned_at**: Timestamp when document was assigned
- **due_date**: When document processing should be completed
- **priority_level**: Critical, High, Medium, Low for task prioritization
- **notes**: Administrative notes about the task or processing requirements

#### Document Status Workflow
```typescript
const documentStatuses = [
  { id: 1, status_name: 'Uploaded', description: 'Document just uploaded, awaiting assignment' },
  { id: 2, status_name: 'Pending Review', description: 'Assigned to staff, awaiting review' },
  { id: 3, status_name: 'In Progress', description: 'Currently being processed by assigned staff' },
  { id: 4, status_name: 'Requires Revision', description: 'Document needs changes or corrections' },
  { id: 5, status_name: 'Under Legal Review', description: 'Being reviewed by legal team' },
  { id: 6, status_name: 'Approved', description: 'Document approved and ready for use' },
  { id: 7, status_name: 'Completed', description: 'Processing completed successfully' },
  { id: 8, status_name: 'Rejected', description: 'Document rejected or not usable' },
  { id: 9, status_name: 'Archived', description: 'Document archived for future reference' }
];
```

#### Access Control for Document Tasking
```typescript
function canAssignDocuments(user: User): boolean {
  return ['SuperAdmin', 'Admin'].includes(user.role.name);
}

function canViewTaskingFields(user: User): boolean {
  return ['SuperAdmin', 'Admin'].includes(user.role.name);
}

function canUpdateDocumentStatus(user: User, document: Document): boolean {
  // SuperAdmin and Admin can always update
  if (['SuperAdmin', 'Admin'].includes(user.role.name)) return true;
  
  // Assigned staff can update status of their assigned documents
  return document.assigned_to === user.id;
}

// Document assignment function
async function assignDocumentToStaff(
  assignerId: string, 
  documentId: string, 
  assigneeId: string, 
  dueDate: Date, 
  priority: string, 
  notes?: string
) {
  const assigner = await getUserById(assignerId);
  
  if (!canAssignDocuments(assigner)) {
    throw new Error('Insufficient permissions to assign documents');
  }
  
  const assignee = await getUserById(assigneeId);
  if (!assignee || !assignee.is_active) {
    throw new Error('Invalid assignee');
  }
  
  await updateDocument(documentId, {
    assigned_to: assigneeId,
    document_status_id: 2, // Pending Review
    assigned_by: assignerId,
    assigned_at: new Date(),
    due_date: dueDate,
    priority_level: priority,
    notes: notes
  });
  
  // Send notification to assigned staff
  await sendDocumentAssignmentNotification(assignee.email, documentId, dueDate);
  
  // Log assignment for audit
  await logDocumentAssignment(documentId, assignerId, assigneeId);
}
```

#### Document Tasking UI Components
```typescript
// Document assignment interface (SuperAdmin/Admin only)
const DocumentAssignment = ({ document, user }: { document: Document, user: User }) => {
  if (!canAssignDocuments(user)) {
    return null; // Hide assignment fields for unauthorized users
  }
  
  return (
    <div className="document-assignment-panel">
      <h3>Document Task Assignment</h3>
      
      <div className="assignment-fields">
        <SelectField 
          label="Assign To"
          options={courtroomStaff}
          value={document.assigned_to}
          onChange={handleAssigneeChange}
        />
        
        <SelectField 
          label="Status"
          options={documentStatuses}
          value={document.document_status_id}
          onChange={handleStatusChange}
        />
        
        <DateField 
          label="Due Date"
          value={document.due_date}
          onChange={handleDueDateChange}
        />
        
        <SelectField 
          label="Priority"
          options={[
            { value: 'Critical', label: 'Critical' },
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' }
          ]}
          value={document.priority_level}
          onChange={handlePriorityChange}
        />
        
        <TextAreaField 
          label="Assignment Notes"
          value={document.notes}
          onChange={handleNotesChange}
          placeholder="Special instructions or requirements..."
        />
      </div>
      
      <Button onClick={handleSaveAssignment}>
        Save Assignment
      </Button>
    </div>
  );
};

// Staff task dashboard
const StaffTaskDashboard = ({ user }: { user: User }) => {
  const [assignedDocuments, setAssignedDocuments] = useState([]);
  
  useEffect(() => {
    // Load documents assigned to current user
    loadAssignedDocuments(user.id);
  }, [user.id]);
  
  return (
    <div className="staff-dashboard">
      <h2>My Assigned Documents</h2>
      
      <div className="task-filters">
        <FilterButton filter="overdue">Overdue ({overdueCount})</FilterButton>
        <FilterButton filter="today">Due Today ({todayCount})</FilterButton>
        <FilterButton filter="in-progress">In Progress ({inProgressCount})</FilterButton>
      </div>
      
      <DocumentTaskList 
        documents={assignedDocuments}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};
```

#### Document Assignment Notifications
```typescript
// Email notification for document assignment
const documentAssignmentEmailTemplate = (
  assigneeName: string,
  documentName: string,
  caseName: string,
  dueDate: string,
  priority: string,
  notes?: string
) => `
<!DOCTYPE html>
<html>
<head>
  <title>Document Assignment - AmicusOnline</title>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <h2>New Document Assignment</h2>
    <p>Hello ${assigneeName},</p>
    
    <p>You have been assigned a new document for processing:</p>
    
    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <strong>Document:</strong> ${documentName}<br>
      <strong>Case:</strong> ${caseName}<br>
      <strong>Due Date:</strong> ${dueDate}<br>
      <strong>Priority:</strong> <span style="color: ${priority === 'Critical' ? '#dc3545' : priority === 'High' ? '#fd7e14' : '#28a745'}">${priority}</span>
    </div>
    
    ${notes ? `<p><strong>Special Instructions:</strong><br>${notes}</p>` : ''}
    
    <p>Please log into AmicusOnline to view the document and update its status as you work on it.</p>
    
    <a href="${process.env.APP_URL}/dashboard" 
       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      View Assignment
    </a>
    
    <hr>
    <p><small>AmicusOnline Case Management System</small></p>
  </div>
</body>
</html>
`;

// Task reminder for overdue documents
async function sendOverdueDocumentReminders() {
  const overdueDocuments = await getOverdueDocuments();
  
  for (const doc of overdueDocuments) {
    if (doc.assigned_to) {
      await sendOverdueReminderEmail(
        doc.assignee.email,
        doc.filename,
        doc.case.title,
        doc.due_date
      );
    }
  }
}
```

#### Reporting & Analytics for Document Tasking
```typescript
// Document processing metrics
async function getDocumentTaskingMetrics(userId?: string, dateRange?: DateRange) {
  const metrics = await db.query(`
    SELECT 
      ds.status_name,
      COUNT(*) as count,
      AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at))/3600) as avg_hours_to_complete
    FROM documents d
    JOIN document_status ds ON d.document_status_id = ds.id
    WHERE 1=1
    ${userId ? 'AND d.assigned_to = ?' : ''}
    ${dateRange ? 'AND d.assigned_at BETWEEN ? AND ?' : ''}
    GROUP BY ds.status_name, ds.id
    ORDER BY ds.id
  `, [userId, dateRange?.start, dateRange?.end].filter(Boolean));
  
  return {
    statusDistribution: metrics,
    totalAssigned: metrics.reduce((sum, m) => sum + m.count, 0),
    averageCompletionTime: metrics
      .filter(m => m.status_name === 'Completed')
      .reduce((sum, m) => sum + m.avg_hours_to_complete, 0)
  };
}
```
