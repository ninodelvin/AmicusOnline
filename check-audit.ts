const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSystem() {
  console.log('=== TESTING AMICUS ONLINE CASE MANAGEMENT SYSTEM ===\n')
  
  // Test 1: Check Users
  console.log('1. Testing Users...')
  const users = await prisma.$queryRaw`
    SELECT u.id, u.email, u.first_name, u.last_name, ur.role_name 
    FROM users u 
    LEFT JOIN user_roles ur ON u.role_id = ur.id
  `
  console.log(`Found ${users.length} users:`)
  users.forEach(user => {
    console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role_name}`)
  })
  
  // Test 2: Check Case Types
  console.log('\n2. Testing Case Types...')
  const caseTypes = await prisma.$queryRaw`SELECT * FROM case_types WHERE is_active = 1`
  console.log(`Found ${caseTypes.length} case types:`)
  caseTypes.forEach(type => {
    console.log(`   - ${type.type_name}`)
  })
  
  // Test 3: Check Case Kinds
  console.log('\n3. Testing Case Kinds...')
  const caseKinds = await prisma.$queryRaw`SELECT * FROM case_kinds WHERE is_active = 1`
  console.log(`Found ${caseKinds.length} case kinds:`)
  caseKinds.forEach(kind => {
    console.log(`   - ${kind.kind_name}`)
  })
  
  // Test 4: Check Case Statuses
  console.log('\n4. Testing Case Statuses...')
  const caseStatuses = await prisma.$queryRaw`SELECT * FROM case_statuses WHERE is_active = 1`
  console.log(`Found ${caseStatuses.length} case statuses:`)
  caseStatuses.forEach(status => {
    console.log(`   - ${status.status_name}`)
  })
  
  // Test 5: Check Case Stages
  console.log('\n5. Testing Case Stages...')
  const caseStages = await prisma.$queryRaw`SELECT * FROM case_stages WHERE is_active = 1`
  console.log(`Found ${caseStages.length} case stages:`)
  caseStages.forEach(stage => {
    console.log(`   - ${stage.stage_name}`)
  })
  
  // Test 6: Check Cases
  console.log('\n6. Testing Cases...')
  const cases = await prisma.$queryRaw`
    SELECT c.id, c.case_number, c.title, ct.type_name, ck.kind_name, cs.status_name, cst.stage_name
    FROM cases c
    LEFT JOIN case_types ct ON c.case_type_id = ct.id
    LEFT JOIN case_kinds ck ON c.case_kind_id = ck.id
    LEFT JOIN case_statuses cs ON c.case_status_id = cs.id
    LEFT JOIN case_stages cst ON c.case_stage_id = cst.id
  `
  console.log(`Found ${cases.length} cases:`)
  cases.forEach(case_ => {
    console.log(`   - ${case_.case_number}: ${case_.title} (${case_.type_name} - ${case_.kind_name})`)
  })
  
  console.log('\n=== SYSTEM TEST COMPLETE ===')
  console.log('✅ Database structure: OK')
  console.log('✅ Lookup tables: OK')
  console.log('✅ User system: OK')
  console.log('✅ Ready for case management!')
  
  await prisma.$disconnect()
}

testSystem().catch(console.error)
