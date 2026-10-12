'use server'

import { getMe } from './auth'
import { prisma } from '~/common/libs/prisma'

export async function searchStudents({
  query,
  page = 1,
  limit = 10,
}: {
  query: string
  page?: number
  limit?: number
}) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const skip = (page - 1) * limit

  const whereClause = {
    // maybe we only want to search students, but if userType is null, maybe just search anyone who isn't a teacher
    userType: 'student', // or whatever identifies a student
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.user.count({ where: whereClause }),
  ])

  return {
    students,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}
