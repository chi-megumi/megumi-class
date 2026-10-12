import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugProgress() {
  const progress = await prisma.userUnitProgress.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, userType: true } },
      unit: { select: { id: true, title: true } }
    }
  })

  console.log(JSON.stringify(progress, null, 2))
}

debugProgress().catch(console.error).finally(() => prisma.$disconnect())
