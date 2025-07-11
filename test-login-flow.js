const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLoginFlow() {
  console.log('🧪 Testing Complete Login Flow')
  console.log('===============================')
  
  const credentials = {
    email: 'admin@amicusonline.com',
    password: 'password123'
  }
  
  console.log('Testing credentials:', credentials)
  
  try {
    // Step 1: Find user (exactly as auth.ts does)
    console.log('\n1. Finding user...')
    const users = await prisma.$queryRaw`
      SELECT u.*, ur.role_name, ur.can_view_all_cases, ur.can_edit_all_cases, 
             ur.can_delete_cases, ur.can_manage_users, ur.can_manage_lookups,
             ur.can_assign_tasks, ur.can_view_reports
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.email = ${credentials.email}
    `

    const user = users[0]
    console.log('User found:', user ? 'Yes' : 'No')

    if (!user) {
      console.log('❌ User not found in database')
      return
    }

    // Step 2: Check account status
    console.log('\n2. Checking account status...')
    console.log('Account locked until:', user.account_locked_until)
    console.log('Is active:', user.is_active)
    console.log('Failed attempts:', user.failed_login_attempts)

    if (user.account_locked_until && user.account_locked_until > new Date()) {
      console.log('❌ Account is locked')
      return
    }

    if (!user.is_active) {
      console.log('❌ Account is not active')
      return
    }

    // Step 3: Verify password (exactly as auth.ts does)
    console.log('\n3. Verifying password...')
    console.log('Input password:', credentials.password)
    console.log('Stored hash:', user.password_hash)
    
    const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
    console.log('Password valid:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ Password verification failed')
      
      // Test if it's a timing issue
      console.log('\n4. Testing alternative comparison methods...')
      const isValid2 = await bcrypt.compare('password123', user.password_hash)
      console.log('Direct comparison result:', isValid2)
      
      // Check if password hash is corrupted
      const testHash = await bcrypt.hash('password123', 10)
      const testCompare = await bcrypt.compare('password123', testHash)
      console.log('New hash comparison works:', testCompare)
      
      return
    }

    console.log('✅ Password verification successful!')
    
    // Step 4: Update login info
    console.log('\n4. Updating login info...')
    await prisma.$executeRaw`
      UPDATE users 
      SET failed_login_attempts = 0, account_locked_until = NULL, last_login = ${new Date()}
      WHERE id = ${user.id}
    `
    console.log('✅ Login info updated')

    // Step 5: Create user object (as auth.ts would)
    console.log('\n5. Creating user object...')
    const userObject = {
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
    
    console.log('✅ User object created:', {
      id: userObject.id,
      email: userObject.email,
      name: userObject.name,
      role: userObject.role
    })
    
    console.log('\n🎉 Login flow completed successfully!')
    console.log('The user should be able to log in with these credentials.')
    
  } catch (error) {
    console.error('❌ Login flow failed:', error)
  }
  
  await prisma.$disconnect()
}

testLoginFlow().catch(console.error)
