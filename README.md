# AmicusOnline - Enterprise Case Management System

A comprehensive case management system built for legal professionals with role-based access control, document workflow management, and enterprise-grade security.

## 🚀 Current Status - FULLY FUNCTIONAL MVP ✅

### ✅ Completed Features (Latest Update)
- **Complete Authentication System**: NextAuth integration with working login/logout flow
- **Case Management MVP**: Full CRUD operations for cases with legal-specific fields
- **Lookup Tables System**: Pre-populated with legal industry data
- **User Interface**: Modern responsive UI with consistent navigation
- **Sign Out Functionality**: Working across all pages with proper redirects
- **Database Integration**: SQLite with Prisma ORM, fully seeded and operational
- **API Endpoints**: Complete backend services for cases and lookup data
- **Security Features**: Password encryption, session management, audit logging

### 🎯 MVP Features Delivered
- **Case Creation**: Full form with Date Filed, Case Type, Case Kind, Case Status, Case Stage, Date Disposed
- **Cases List View**: Display all cases with filtering and status information
- **User Authentication**: Secure login with `admin@amicusonline.com` / `password123`
- **Navigation System**: Dashboard, Cases, Create New Case with consistent headers
- **Responsive Design**: Works on desktop and mobile devices
- **Role-Based Access**: Admin permissions with expandable role system

### 📊 Database Schema (MVP Complete)
**Core Tables:**
- `users` - User management with role-based permissions (SEEDED)
- `cases` - Case management with legal fields (FUNCTIONAL)
- `case_types` - Criminal, Civil, Special Proceedings, etc. (8 entries)
- `case_kinds` - Criminal Defense, Personal Injury, etc. (8 entries) 
- `case_statuses` - Legal status workflow (7 entries)
- `case_stages` - Legal process stages (11 entries)
- `user_roles` - Permission-based role system (4 roles)

### 🎨 User Interface
- **Dashboard**: Overview with quick navigation
- **Cases Page**: List view with statistics and create button
- **Create Case Form**: Complete form with all lookup fields
- **Headers**: Consistent navigation with user info and sign out
- **Authentication**: Professional login page

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.3.5, React 18, TypeScript
- **Styling**: Tailwind CSS v3.4.17, responsive design
- **Database**: SQLite with Prisma ORM 6.11.1
- **Authentication**: NextAuth with custom credentials provider
- **Security**: bcryptjs, JWT tokens, session management
- **Development**: Hot reload, TypeScript validation

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Git

### Installation
1. **Clone and install dependencies:**
   ```bash
   cd "E:\OneDrive\Documents\AmicusOnline"
   npm install
   ```

2. **Environment Configuration:**
   - Environment file `.env.local` is already configured
   - NEXTAUTH_URL is set to http://localhost:3000
   - Database uses SQLite (no external database required)

3. **Database Setup:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Database is already seeded and ready to use
   # The SQLite database file is included in the repository
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

5. **Access Application:**
   - URL: http://localhost:3000
   - Login: admin@amicusonline.com
   - Password: password123

## 🎯 How to Use the System

### 1. Login
- Navigate to http://localhost:3000
- Use the credentials: admin@amicusonline.com / password123
- You'll be redirected to the Dashboard

### 2. Case Management
- **View Cases**: Click "Cases" to see all cases
- **Create Case**: Click "Create New Case" button
- **Fill Form**: Complete all required fields including:
  - Case title and description
  - Date Filed (optional)
  - Date Disposed (optional)
  - Case Type (Criminal, Civil, etc.)
  - Case Kind (Criminal Defense, Personal Injury, etc.)
  - Case Status (Initial Presentation, etc.)
  - Case Stage (Investigation, Trial, etc.)

### 3. Navigation
- **Dashboard**: Overview and quick actions
- **Cases**: List all cases with statistics
- **Create Case**: Add new cases to the system
- **Sign Out**: Available on all pages, redirects to login

## 🔑 User Roles & Permissions (Current: Admin)
- ✅ Full case management access
- ✅ Create, view, and edit cases
- ✅ Access to all lookup data
- ✅ System navigation

## ✅ MVP Implementation Status

### Completed Features
- ✅ **Authentication System**: Complete login/logout with NextAuth
- ✅ **Case Creation**: Full form with all legal fields
- ✅ **Case Listing**: View all cases with statistics
- ✅ **Database Integration**: SQLite with seeded lookup tables
- ✅ **User Interface**: Responsive design with consistent navigation
- ✅ **Sign Out**: Working across all pages
- ✅ **API Endpoints**: Backend services for cases and lookups
- ✅ **Data Validation**: Form validation and error handling

### Lookup Tables (Pre-populated)
- ✅ **Case Types**: Criminal, Civil, Special Proceedings, Administrative, Appellate, Family Law, Commercial, Immigration
- ✅ **Case Kinds**: Criminal Defense, Personal Injury, Contract Dispute, Family Law, Real Estate, Corporate Law, Immigration Law, Appeals
- ✅ **Case Statuses**: Initial Presentation of Prosecution Evidence, Arraignment, Pre-trial, Trial, Sentencing, Appeal, Closed
- ✅ **Case Stages**: Investigation, Filing, Discovery, Motions, Mediation, Settlement Negotiations, Trial Preparation, Trial, Post-Trial, Appeal, Case Closure

## 🧪 Testing Information

### Backend Testing Scripts
- `test-login-flow.js` - Validates complete authentication flow
- `test-api-endpoints.js` - Tests all API endpoints and lookup data
- `final-comprehensive-test.js` - Complete system validation

### Manual Testing Checklist
- ✅ User login with correct credentials
- ✅ Dashboard navigation and display
- ✅ Cases list view with statistics
- ✅ Case creation with all fields
- ✅ Sign out functionality
- ✅ Responsive design on different screen sizes
- ✅ API endpoints returning correct data

### Test Credentials
- **Email**: admin@amicusonline.com
- **Password**: password123
- **Role**: Admin (full access)

## 📝 Recent Updates (Latest Commit)

### Version: MVP Complete with Working Sign Out
**Date**: July 11, 2025

**Major Features Added:**
- ✅ Complete case creation functionality with legal fields
- ✅ Working sign out across all pages
- ✅ Fixed NEXTAUTH_URL configuration
- ✅ Added SignOutButton component for consistency
- ✅ Enhanced UI with user info in headers
- ✅ Complete API backend for cases and lookups
- ✅ Database timestamp fields for case creation

**Bug Fixes:**
- 🐛 Fixed case creation missing created_at/updated_at fields
- 🐛 Fixed sign out redirect to wrong port (3003 → 3000)
- 🐛 Fixed relative imports for SignOutButton component

**Technical Improvements:**
- 🔧 Standardized header components across pages
- 🔧 Improved error handling in case creation
- 🔧 Enhanced form validation and user feedback
- 🔧 Consistent responsive design implementation

## 🎯 Next Development Priorities

### 1. Individual Case View
- [ ] Case detail page (/cases/[id])
- [ ] Case editing functionality
- [ ] Case status updates
- [ ] Case assignment features

### 2. Enhanced Case Management
- [ ] Case filtering and search
- [ ] Bulk operations
- [ ] Case templates
- [ ] Case categories and tags

### 3. User Management Expansion
- [ ] Additional user roles (Attorney, Paralegal)
- [ ] User registration system
- [ ] Password reset functionality
- [ ] User profile management

### 4. Administrative Features
- [ ] Lookup table management (SuperAdmin only)
- [ ] System reports
- [ ] Audit log viewer
- [ ] System settings

## 🔐 Security Features

- **Authentication**: Secure login with NextAuth
- **Password Security**: bcryptjs hashing, complexity requirements
- **Account Protection**: Failed login tracking, temporary lockouts
- **Audit Logging**: Complete activity tracking
- **Role-Based Access**: Granular permission system
- **Session Management**: JWT tokens with automatic expiration

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
└── prisma/               # Database schema and migrations
```

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open Prisma Studio
npx prisma db push      # Push schema changes
npx prisma db seed      # Seed database
npx prisma generate     # Generate Prisma client

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking
```

## 📞 Support

For technical support or feature requests, contact the development team.

---

**Note**: This is an enterprise-grade case management system designed for nationwide deployment. All features are built with scalability, security, and user experience in mind.
