import { PrismaClient } from '@prisma/client'
import { vocabData } from './vocabData'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding categories...')
  const categories = [
    { slug: 'stress', name: 'Áp lực & Cảm xúc', emoji: '😰', sortOrder: 1 },
    { slug: 'solution', name: 'Bí kíp giải tỏa', emoji: '🌿', sortOrder: 2 },
    { slug: 'tech', name: 'Mạng xã hội & Net', emoji: '📱', sortOrder: 3 },
    { slug: 'school', name: 'Học tập & Bạn bè', emoji: '🏫', sortOrder: 4 },
  ]

  const createdCategories = []
  for (const cat of categories) {
    const c = await prisma.vocabCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
    createdCategories.push(c)
  }

  console.log('Seeding vocab items...')
  for (let i = 0; i < vocabData.length; i++) {
    const item = vocabData[i]
    const category = createdCategories.find(c => c.slug === item.cat)
    if (!category) {
      console.warn(`Category ${item.cat} not found for word ${item.word}`)
      continue
    }

    await prisma.vocabItem.create({
      data: {
        categoryId: category.id,
        word: item.word,
        ipa: item.ipa,
        pos: item.pos,
        vi: item.vi,
        emoji: item.emoji,
        tip: item.tip,
        example: item.example,
        exampleVi: item.exampleVi,
        sortOrder: i,
      }
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
