// Set DATABASE_URL environment variable directly
process.env.DATABASE_URL = "file:./dev.db"

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simplifyRoleStructure() {
  console.log('🔧 Simplifying Role Structure to 3 Roles')
  console.log('==========================================')
  
  try {
    // Step 1: Show current roles
    console.log('\n📋 Current Roles:')
    const currentRoles = await prisma.$queryRaw`
      SELECT id, role_name, can_manage_users, can_edit_all_cases, can_delete_cases
      FROM user_roles
      ORDER BY id
    `
    
    currentRoles.forEach(role => {
      console.log(`${role.id}: ${role.role_name} - ManageUsers: ${role.can_manage_users}, EditCases: ${role.can_edit_all_cases}, DeleteCases: ${role.can_delete_cases}`)
    })

    // Step 2: Update role structure to 3 simplified roles
    console.log('\n🔄 Updating to 3-Role Structure...')
    
    // Update Role 1: SuperAdmin (unchanged - full access)
    await prisma.$executeRaw`
      UPDATE user_roles 
      SET role_name = 'SuperAdmin',
          can_view_all_cases = 1,
          can_edit_all_cases = 1,
          can_delete_cases = 1,
          can_manage_users = 1,
          can_manage_lookups = 1,
          can_assign_tasks = 1,
          can_view_reports = 1
      WHERE id = 1
    `
    console.log('✅ Updated SuperAdmin role')

    // Update Role 2: Admin (can manage users and cases, but no system lookups)
    await prisma.$executeRaw`
      UPDATE user_roles 
      SET role_name = 'Admin',
          can_view_all_cases = 1,
          can_edit_all_cases = 1,
          can_delete_cases = 1,
          can_manage_users = 1,
          can_manage_lookups = 0,
          can_assign_tasks = 1,
          can_view_reports = 1
      WHERE id = 2
    `
    console.log('✅ Updated Admin role')

    // Update Role 3: Regular (basic case access only)
    await prisma.$executeRaw`
      UPDATE user_roles 
      SET role_name = 'Regular',
          can_view_all_cases = 0,
          can_edit_all_cases = 0,
          can_delete_cases = 0,
          can_manage_users = 0,
          can_manage_lookups = 0,
          can_assign_tasks = 0,
          can_view_reports = 1
      WHERE id = 3
    `
    console.log('✅ Updated Regular role (was Attorney)')

    // Step 3: Delete Role 4 (Paralegal) and migrate users
    console.log('\n🔄 Migrating Paralegal users to Regular role...')
    
    // Move all Paralegal users to Regular role
    await prisma.$executeRaw`
      UPDATE users 
      SET role_id = 3 
      WHERE role_id = 4
    `
    
    // Delete the Paralegal role
    await prisma.$executeRaw`
      DELETE FROM user_roles WHERE id = 4
    `
    console.log('✅ Migrated Paralegal users to Regular and removed Paralegal role')

    // Step 4: Show updated structure
    console.log('\n📋 Updated Role Structure:')
    const updatedRoles = await prisma.$queryRaw`
      SELECT id, role_name, can_view_all_cases, can_edit_all_cases, can_delete_cases,
             can_manage_users, can_manage_lookups, can_assign_tasks, can_view_reports
      FROM user_roles
      ORDER BY id
    `
    
    updatedRoles.forEach(role => {
      console.log(`\n${role.id}. ${role.role_name}:`)
      console.log(`   View All Cases: ${role.can_view_all_cases ? 'Yes' : 'No'}`)
      console.log(`   Edit All Cases: ${role.can_edit_all_cases ? 'Yes' : 'No'}`)
      console.log(`   Delete Cases: ${role.can_delete_cases ? 'Yes' : 'No'}`)
      console.log(`   Manage Users: ${role.can_manage_users ? 'Yes' : 'No'}`)
      console.log(`   Manage Lookups: ${role.can_manage_lookups ? 'Yes' : 'No'}`)
      console.log(`   Assign Tasks: ${role.can_assign_tasks ? 'Yes' : 'No'}`)
      console.log(`   View Reports: ${role.can_view_reports ? 'Yes' : 'No'}`)
    })

    // Step 5: Show updated user distribution
    console.log('\n👥 Updated User Distribution:')
    const users = await prisma.$queryRaw`
      SELECT ur.role_name, COUNT(*) as user_count
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.is_active = 1
      GROUP BY ur.role_name
      ORDER BY ur.id
    `
    
    users.forEach(roleCount => {
      console.log(`${roleCount.role_name}: ${roleCount.user_count} users`)
    })

    console.log('\n🎉 Role structure simplified successfully!')
    console.log('📋 Summary:')
    console.log('  • SuperAdmin: Full system access')
    console.log('  • Admin: User & case management (no system lookups)')
    console.log('  • Regular: Basic case access only')
    console.log('  • Only SuperAdmin and Admin can manage users')

  } catch (error) {
    console.error('❌ Error updating role structure:', error)
  }
  
  await prisma.$disconnect()
}

simplifyRoleStructure().catch(console.error)
