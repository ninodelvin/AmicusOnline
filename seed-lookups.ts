import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedLookups() {
  console.log('Seeding lookup tables...')

  // Seed Case Kinds
  const caseKinds = [
    'Litigation',
    'Transactional', 
    'Advisory',
    'Compliance',
    'Investigation',
    'Negotiation',
    'Arbitration',
    'Mediation'
  ]

  for (const kindName of caseKinds) {
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO case_kinds (kind_name, description, is_active, created_at) 
      VALUES (${kindName}, ${kindName + ' type of legal work'}, 1, datetime('now'))
    `
  }

  // Seed Case Stages
  const caseStages = [
    { name: 'Initial Consultation', order: 1 },
    { name: 'Case Assessment', order: 2 },
    { name: 'Client Intake', order: 3 },
    { name: 'Discovery', order: 4 },
    { name: 'Motion Practice', order: 5 },
    { name: 'Negotiation', order: 6 },
    { name: 'Trial Preparation', order: 7 },
    { name: 'Trial', order: 8 },
    { name: 'Settlement', order: 9 },
    { name: 'Appeal', order: 10 },
    { name: 'Case Closure', order: 11 }
  ]

  for (const stage of caseStages) {
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO case_stages (stage_name, description, is_active, sort_order, created_at) 
      VALUES (${stage.name}, ${stage.name + ' phase of case management'}, 1, ${stage.order}, datetime('now'))
    `
  }

  console.log('Lookup tables seeded successfully!')
}

seedLookups()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
