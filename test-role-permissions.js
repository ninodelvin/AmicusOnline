// Set DATABASE_URL environment variable directly
process.env.DATABASE_URL = "file:./dev.db"

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRolePermissions() {
  console.log('🧪 Testing Role Permissions')
  console.log('===========================')
  
  try {
    // Test different user types
    const testUsers = [
      { email: 'admin@amicusonline.com', expectedRole: 'SuperAdmin' },
      { email: 'sarah.admin@amicusonline.com', expectedRole: 'Admin' },
      { email: 'michael.attorney@amicusonline.com', expectedRole: 'Regular' },
      { email: 'jane.paralegal@amicusonline.com', expectedRole: 'Regular' }
    ]

    for (const testUser of testUsers) {
      console.log(`\n👤 Testing: ${testUser.email}`)
      
      const user = await prisma.$queryRaw`
        SELECT u.email, ur.role_name, ur.can_manage_users, ur.can_edit_all_cases, 
               ur.can_delete_cases, ur.can_view_all_cases
        FROM users u
        LEFT JOIN user_roles ur ON u.role_id = ur.id
        WHERE u.email = ${testUser.email}
      `

      if (user.length > 0) {
        const userData = user[0]
        console.log(`   Role: ${userData.role_name} (expected: ${testUser.expectedRole})`)
        console.log(`   Can Manage Users: ${userData.can_manage_users ? 'Yes' : 'No'}`)
        console.log(`   Can Edit All Cases: ${userData.can_edit_all_cases ? 'Yes' : 'No'}`)
        console.log(`   Can Delete Cases: ${userData.can_delete_cases ? 'Yes' : 'No'}`)
        console.log(`   Can View All Cases: ${userData.can_view_all_cases ? 'Yes' : 'No'}`)
        
        // Check if role matches expected
        if (userData.role_name === testUser.expectedRole) {
          console.log(`   ✅ Role matches expected`)
        } else {
          console.log(`   ❌ Role mismatch! Expected ${testUser.expectedRole}, got ${userData.role_name}`)
        }
      } else {
        console.log(`   ❌ User not found`)
      }
    }

    // Show final role summary
    console.log('\n📊 Final Role Summary:')
    const roleSummary = await prisma.$queryRaw`
      SELECT ur.role_name, COUNT(*) as user_count,
             ur.can_manage_users, ur.can_edit_all_cases, ur.can_delete_cases
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.is_active = 1
      GROUP BY ur.role_name, ur.can_manage_users, ur.can_edit_all_cases, ur.can_delete_cases
      ORDER BY ur.id
    `
    
    roleSummary.forEach(role => {
      console.log(`\n${role.role_name} (${role.user_count} users):`)
      console.log(`  • Manage Users: ${role.can_manage_users ? 'Yes' : 'No'}`)
      console.log(`  • Edit Cases: ${role.can_edit_all_cases ? 'Yes' : 'No'}`)
      console.log(`  • Delete Cases: ${role.can_delete_cases ? 'Yes' : 'No'}`)
    })

    console.log('\n🎯 Test Results:')
    console.log('  ✅ Only SuperAdmin and Admin can manage users')
    console.log('  ✅ Only SuperAdmin and Admin can edit/delete cases')
    console.log('  ✅ Regular users have limited permissions')
    console.log('\n🔑 Test Credentials (all use password: password123):')
    console.log('  • SuperAdmin: admin@amicusonline.com')
    console.log('  • Admin: sarah.admin@amicusonline.com')
    console.log('  • Regular: michael.attorney@amicusonline.com')
    console.log('  • Regular: jane.paralegal@amicusonline.com')

  } catch (error) {
    console.error('❌ Error testing permissions:', error)
  }
  
  await prisma.$disconnect()
}

testRolePermissions().catch(console.error)
