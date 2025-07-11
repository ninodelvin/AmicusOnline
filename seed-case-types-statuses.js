const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedCaseTypesAndStatuses() {
  console.log('Seeding case types...')
  
  const caseTypes = [
    'Criminal',
    'Civil', 
    'Special Proceedings',
    'Special Civil Action',
    'Land Registration',
    'Admiralty',
    'Maritime',
    'Environment'
  ]
  
  for (const typeName of caseTypes) {
    try {
      const existing = await prisma.$queryRaw`SELECT * FROM case_types WHERE type_name = ${typeName}`
      
      if (existing.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO case_types (type_name, description, is_active)
          VALUES (${typeName}, ${`${typeName} case type`}, 1)
        `
        console.log(`Created case type: ${typeName}`)
      } else {
        console.log(`Case type already exists: ${typeName}`)
      }
    } catch (error) {
      console.error(`Error creating case type ${typeName}:`, error)
    }
  }
  
  console.log('Seeding case statuses...')
  
  const caseStatuses = [
    'Initial Presentation of Prosecution Evidence',
    'Initial Presentation of Defense Evidence',
    'Cross-Examination',
    'Re-Direct Examination',
    'Re-Cross Examination',
    'Rebuttal Evidence',
    'Sur-Rebuttal Evidence'
  ]
  
  for (const statusName of caseStatuses) {
    try {
      const existing = await prisma.$queryRaw`SELECT * FROM case_statuses WHERE status_name = ${statusName}`
      
      if (existing.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO case_statuses (status_name, description, is_active)
          VALUES (${statusName}, ${`${statusName} status`}, 1)
        `
        console.log(`Created case status: ${statusName}`)
      } else {
        console.log(`Case status already exists: ${statusName}`)
      }
    } catch (error) {
      console.error(`Error creating case status ${statusName}:`, error)
    }
  }
  
  console.log('Case types and statuses seeding complete!')
}

seedCaseTypesAndStatuses()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
