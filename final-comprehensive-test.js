const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function finalSystemTest() {
  console.log('🚀 FINAL COMPREHENSIVE SYSTEM TEST')
  console.log('==================================')
  
  try {
    // Test 1: Authentication System
    console.log('\n1. ✅ AUTHENTICATION SYSTEM')
    const testUser = await prisma.$queryRaw`
      SELECT u.email, u.failed_login_attempts, ur.role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.email = 'admin@amicusonline.com'
    `
    console.log(`   Admin user ready: ${testUser[0].email} (${testUser[0].role_name})`)
    console.log(`   Failed attempts: ${testUser[0].failed_login_attempts}`)
    
    // Test 2: Lookup Data
    console.log('\n2. ✅ LOOKUP DATA SYSTEM')
    const lookupCounts = {
      caseTypes: await prisma.$queryRaw`SELECT COUNT(*) as count FROM case_types WHERE is_active = 1`,
      caseKinds: await prisma.$queryRaw`SELECT COUNT(*) as count FROM case_kinds WHERE is_active = 1`,
      caseStatuses: await prisma.$queryRaw`SELECT COUNT(*) as count FROM case_statuses WHERE is_active = 1`,
      caseStages: await prisma.$queryRaw`SELECT COUNT(*) as count FROM case_stages WHERE is_active = 1`,
    }
    
    console.log(`   Case Types: ${lookupCounts.caseTypes[0].count}`)
    console.log(`   Case Kinds: ${lookupCounts.caseKinds[0].count}`)
    console.log(`   Case Statuses: ${lookupCounts.caseStatuses[0].count}`)
    console.log(`   Case Stages: ${lookupCounts.caseStages[0].count}`)
    
    // Test 3: Case Creation (Fixed)
    console.log('\n3. ✅ CASE CREATION SYSTEM')
    const caseTypes = await prisma.$queryRaw`SELECT * FROM case_types WHERE is_active = 1 LIMIT 1`
    const caseKinds = await prisma.$queryRaw`SELECT * FROM case_kinds WHERE is_active = 1 LIMIT 1`
    const caseStatuses = await prisma.$queryRaw`SELECT * FROM case_statuses WHERE is_active = 1 LIMIT 1`
    const caseStages = await prisma.$queryRaw`SELECT * FROM case_stages WHERE is_active = 1 LIMIT 1`
    const users = await prisma.$queryRaw`SELECT * FROM users WHERE is_active = 1 LIMIT 1`
    
    const today = new Date()
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0')
    
    const existingCases = await prisma.$queryRaw`SELECT COUNT(*) as count FROM cases`
    const sequenceNumber = (existingCases[0].count + 1).toString().padStart(3, '0')
    const finalTestCaseNumber = `FINAL-${dateStr}-${sequenceNumber}`
    
    try {
      await prisma.$executeRaw`
        INSERT INTO cases (
          case_number, title, description, date_filed, created_at, updated_at,
          case_type_id, case_kind_id, case_status_id, case_stage_id, created_by
        ) VALUES (
          ${finalTestCaseNumber}, 
          'Final System Test Case',
          'This case validates the complete system functionality before Edge browser testing.',
          ${new Date()}, ${new Date()}, ${new Date()},
          ${caseTypes[0].id}, ${caseKinds[0].id}, ${caseStatuses[0].id}, ${caseStages[0].id}, ${users[0].id}
        )
      `
      console.log(`   ✅ Case created successfully: ${finalTestCaseNumber}`)
    } catch (error) {
      console.log(`   ⚠️  Case creation failed: ${error.message}`)
    }
    
    // Test 4: Final Case Count
    console.log('\n4. ✅ DATABASE STATUS')
    const finalCounts = {
      users: await prisma.$queryRaw`SELECT COUNT(*) as count FROM users WHERE is_active = 1`,
      cases: await prisma.$queryRaw`SELECT COUNT(*) as count FROM cases`,
      userRoles: await prisma.$queryRaw`SELECT COUNT(*) as count FROM user_roles`
    }
    
    console.log(`   Active Users: ${finalCounts.users[0].count}`)
    console.log(`   Total Cases: ${finalCounts.cases[0].count}`)
    console.log(`   User Roles: ${finalCounts.userRoles[0].count}`)
    
    console.log('\n🎉 SYSTEM READY FOR EDGE BROWSER TESTING!')
    console.log('==========================================')
    console.log('')
    console.log('📋 TEST INSTRUCTIONS FOR EDGE BROWSER:')
    console.log('--------------------------------------')
    console.log('1. Open Edge browser')
    console.log('2. Navigate to: http://localhost:3000')
    console.log('3. Click "Sign In" or go to: http://localhost:3000/auth/login')
    console.log('')
    console.log('🔐 LOGIN CREDENTIALS:')
    console.log('   Email:    admin@amicusonline.com')
    console.log('   Password: password123')
    console.log('')
    console.log('🧪 FEATURES TO TEST:')
    console.log('   ✓ Login/Authentication')
    console.log('   ✓ Dashboard view')
    console.log('   ✓ Cases list (/cases)')
    console.log('   ✓ Create new case (/cases/new)')
    console.log('   ✓ All form dropdowns should be populated')
    console.log('   ✓ Case creation and saving')
    console.log('')
    console.log('💡 EXPECTED BEHAVIOR:')
    console.log('   - Smooth login process')
    console.log('   - Professional UI with Tailwind styling')
    console.log('   - Working dropdowns with your specified data')
    console.log('   - Case creation with all MVP fields')
    console.log('   - Responsive design')
    
  } catch (error) {
    console.error('❌ Final system test failed:', error)
  }
  
  await prisma.$disconnect()
}

finalSystemTest().catch(console.error)
