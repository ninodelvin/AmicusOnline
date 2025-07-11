const { PrismaClient } = require('@prisma/client');

// Set the database URL for this script
process.env.DATABASE_URL = "file:./prisma/dev.db";

const prisma = new PrismaClient();

async function checkRegularUserPermissions() {
  console.log('🔍 Checking Regular User Permissions');
  console.log('====================================');
  
  const regularUsers = await prisma.$queryRaw`
    SELECT u.first_name, u.last_name, u.email, ur.role_name,
           ur.can_view_all_cases, ur.can_edit_all_cases, ur.can_delete_cases,
           ur.can_manage_users, ur.can_manage_lookups, ur.can_assign_tasks,
           ur.can_view_reports
    FROM users u
    LEFT JOIN user_roles ur ON u.role_id = ur.id
    WHERE ur.role_name = 'Regular'
    LIMIT 1
  `;
  
  if (regularUsers.length > 0) {
    const user = regularUsers[0];
    console.log('Regular User Example:', user.first_name, user.last_name);
    console.log('Permissions:');
    console.log('- Can view all cases:', user.can_view_all_cases === 1);
    console.log('- Can edit all cases:', user.can_edit_all_cases === 1);
    console.log('- Can delete cases:', user.can_delete_cases === 1);
    console.log('- Can manage users:', user.can_manage_users === 1);
    console.log('- Can manage lookups:', user.can_manage_lookups === 1);
    console.log('- Can assign tasks:', user.can_assign_tasks === 1);
    console.log('- Can view reports:', user.can_view_reports === 1);
  }
  
  await prisma.$disconnect();
}

checkRegularUserPermissions().catch(console.error);
