'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from './auth'
import { prisma } from '~/common/libs/prisma'
import { TestContent, TestBlock, TestQuestion } from '@/modules/teacher/types'

export type CreateClassInput = {
  name: string
  description?: string
  inviteCode?: string
  units: { name: string }[]
  studentIds?: string[]
}

export async function createClassAction(data: CreateClassInput) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  // Generate invite code if not provided
  let inviteCode = data.inviteCode?.trim() || ''
  if (!inviteCode) {
    inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const validStudentIds = Array.from(new Set((data.studentIds || []).filter((id) => id !== '')))

  const newClass = await prisma.class.create({
    data: {
      name: data.name,
      description: data.description,
      inviteCode: inviteCode,
      teacherId: user.id,
      units: {
        create: data.units
          .filter((u) => u.name.trim() !== '')
          .map((unit, index) => ({
            title: unit.name,
            sortOrder: index,
            isPublished: true,
          })),
      },
      students: {
        create: validStudentIds.map((studentId) => ({
          studentId,
        })),
      },
    },
  })

  revalidatePath('/')
  return { success: true, classId: newClass.id }
}

export async function getTeacherClasses() {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    return []
  }

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    include: {
      units: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          title: true,
          classId: true,
          isPublished: true,
          exams: true
        }
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return classes
}

// Utility to shuffle an array
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// Utility to sanitize exams for student view (remove correctIndex and answers)
const sanitizeExams = (exams: any[]) => {
  if (!Array.isArray(exams)) return [];
  return exams.map((test: any) => {
    if (!test.content) return test;
    const sanitizedBlocks = test.content.map((block: any) => {
      if (block.type === 'multiple_choice') {
        return {
          ...block,
          content: {
            ...block.content,
            questions: block.content?.questions?.map((q: any) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { correctIndex, ...rest } = q;
              return rest;
            })
          }
        }
      } else if (block.type === 'fill_blank') {
        if (Array.isArray(block.content?.questions)) {
          return {
            ...block,
            content: {
              ...block.content,
              questions: block.content.questions.map((q: any) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { answer, ...rest } = q;
                return rest;
              })
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { answer, ...restContent } = block.content || {};
        return {
          ...block,
          content: restContent
        }
      } else if (block.type === 'matching') {
        const pairs = Array.isArray(block.content?.pairs) ? block.content.pairs : []
        const sanitizedPairs = pairs.map((p: any) => ({
          id: p.id,
          left: p.left,
        }))
        const shuffledRight = shuffleArray(
          pairs.map((p: any) => ({
            id: p.id,
            text: p.right || '',
          }))
        )
        return {
          ...block,
          content: {
            ...block.content,
            pairs: sanitizedPairs,
            shuffledRight,
          }
        }
      } else if (block.type === 'reorder') {
        const questions = Array.isArray(block.content?.questions) ? block.content.questions : []
        const sanitizedQuestions = questions.map((q: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { sentence, ...rest } = q
          const words = shuffleArray((sentence || '').trim().split(/\s+/).filter(Boolean))
          return {
            ...rest,
            words,
          }
        })
        return {
          ...block,
          content: {
            ...block.content,
            questions: sanitizedQuestions,
          }
        }
      }
      return block;
    });
    return {
      ...test,
      content: sanitizedBlocks
    }
  });
}

export async function getStudentClasses() {
  const user = await getMe()
  if (!user || (user.role === 'teacher' || user.role === 'TEACHER')) {
    return []
  }

  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId: user.id, status: 'active' },
    include: {
      class: {
        include: {
          units: {
            where: { isPublished: true },
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              title: true,
              classId: true,
              isPublished: true,
              exams: {
                where: { isPublished: true, isEnabled: true }
              }
            }
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  return enrollments.map((e) => {
    return {
      ...e.class,
      units: e.class.units.map(unit => ({
        ...unit,
        exams: sanitizeExams(unit.exams || [])
      }))
    }
  })
}

export async function requestJoinClass(inviteCode: string) {
  const user = await getMe()
  if (!user) {
    throw new Error('Vui lòng đăng nhập để tham gia lớp học')
  }

  const code = inviteCode.trim().toUpperCase()
  if (!code) {
    throw new Error('Mã tham gia không hợp lệ')
  }

  const targetClass = await prisma.class.findUnique({
    where: { inviteCode: code },
  })

  if (!targetClass) {
    throw new Error('Lớp học không tồn tại hoặc mã tham gia không đúng')
  }

  if (targetClass.teacherId === user.id) {
    throw new Error('Bạn là giáo viên của lớp học này rồi')
  }

  // Check if already enrolled or pending
  const existingEnrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId: targetClass.id,
        studentId: user.id,
      },
    },
  })

  if (existingEnrollment) {
    if (existingEnrollment.status === 'pending') {
      throw new Error('Bạn đã gửi yêu cầu tham gia lớp này rồi, vui lòng chờ giáo viên duyệt.')
    }
    if (existingEnrollment.status === 'active') {
      throw new Error('Bạn đã ở trong lớp học này rồi.')
    }
    // if rejected, maybe allow re-request? For now just say already requested
    throw new Error('Không thể tham gia lớp học này.')
  }

  // Create pending enrollment
  await prisma.classEnrollment.create({
    data: {
      classId: targetClass.id,
      studentId: user.id,
      status: 'pending',
    },
  })

  revalidatePath('/')
  return { success: true, message: 'Đã gửi yêu cầu tham gia lớp học thành công' }
}

export async function getTeacherClassDetails(classId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    return null
  }

  const classData = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
    include: {
      exams: {
        where: { unitId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            where: { completedAt: { not: null } },
            include: {
              student: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      },
      units: {
        orderBy: { createdAt: 'asc' },
        include: {
          vocabItems: {
            orderBy: { sortOrder: 'asc' },
          },
          studentProgress: true,
          exams: {
            orderBy: { createdAt: 'asc' },
            include: {
              results: {
                where: { completedAt: { not: null } },
                include: {
                  student: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                  },
                },
              },
            },
          },
        },
      },
      students: {
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  })

  return classData
}

export async function updateEnrollmentStatus(enrollmentId: string, status: 'active' | 'rejected') {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  // Verify teacher owns this class
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { class: true },
  })

  if (!enrollment || enrollment.class.teacherId !== user.id) {
    throw new Error('Không tìm thấy thông tin hoặc bạn không có quyền')
  }

  await prisma.classEnrollment.update({
    where: { id: enrollmentId },
    data: { status },
  })

  revalidatePath(`/teacher/classes/${enrollment.classId}`)
  return { success: true }
}

export async function removeStudentFromClass(enrollmentId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const enrollment = await prisma.classEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { class: true },
  })

  if (!enrollment || enrollment.class.teacherId !== user.id) {
    throw new Error('Không tìm thấy thông tin hoặc bạn không có quyền')
  }

  await prisma.classEnrollment.delete({
    where: { id: enrollmentId },
  })

  revalidatePath(`/teacher/classes/${enrollment.classId}`)
  return { success: true }
}

export async function addStudentsToClass(classId: string, studentIds: string[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) {
    throw new Error('Không tìm thấy lớp học hoặc bạn không có quyền')
  }

  const validIds = studentIds.filter(id => id.trim() !== '')
  if (validIds.length === 0) return { success: true }

  // Create active enrollments for students not already in the class
  for (const sId of validIds) {
    await prisma.classEnrollment.upsert({
      where: {
        classId_studentId: { classId, studentId: sId }
      },
      update: { status: 'active' },
      create: { classId, studentId: sId, status: 'active' }
    })
  }

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true }
}

export async function createUnit(classId: string, title: string, description?: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  await prisma.unit.create({
    data: {
      classId,
      title: title.trim(),
      description: description?.trim() || '',
    }
  })

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true }
}

export async function updateUnitVocab(unitId: string, vocabItems: { word: string, vi: string, ipa?: string | null, pos?: string | null, emoji?: string | null, example?: string | null, exampleVi?: string | null }[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // Transaction: Delete existing vocabs in unit, then create new ones
  await prisma.$transaction([
    prisma.vocabItem.deleteMany({
      where: { unitId },
    }),
    prisma.vocabItem.createMany({
      data: vocabItems.map((item, index) => ({
        unitId,
        word: item.word,
        vi: item.vi,
        ipa: item.ipa || null,
        pos: item.pos || null,
        emoji: item.emoji || null,
        example: item.example || null,
        exampleVi: item.exampleVi || null,
        sortOrder: index,
      })),
    })
  ])

  revalidatePath(`/teacher/classes/${unit.classId}`)
  return { success: true }
}

export async function deleteUnit(unitId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  await prisma.unit.delete({
    where: { id: unitId },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  return { success: true }
}

export async function updateUnitSettings(
  unitId: string,
  settings: {
    isFlashcardEnabled?: boolean
    isQuizEnabled?: boolean
    isMatchEnabled?: boolean
    isPublished?: boolean
  }
) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  await prisma.unit.update({
    where: { id: unitId },
    data: settings,
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true }
}

export async function getStudentClassDetails(classId: string) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  if (user.role === 'teacher' || user.role === 'TEACHER') {
    const classOwned = await prisma.class.findUnique({
      where: { id: classId, teacherId: user.id },
      include: {
        units: {
          orderBy: { createdAt: 'asc' },
          include: { exams: true },
        },
        exams: {
          where: { unitId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            results: {
              where: { studentId: user.id },
            },
          },
        },
      },
    })
    if (classOwned) {
      return {
        ...classOwned,
        exams: sanitizeExams(classOwned.exams || []),
      }
    }
  }

  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: user.id } },
  })
  if (!enrollment || enrollment.status !== 'active') throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      units: {
        where: { isPublished: true },
        orderBy: { createdAt: 'asc' },
      },
      exams: {
        where: { isPublished: true, isEnabled: true, unitId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            where: { studentId: user.id },
          },
        },
      },
    },
  })

  if (!targetClass) return null

  return {
    ...targetClass,
    exams: sanitizeExams(targetClass.exams || []),
  }
}

export async function getStudentUnitDetails(unitId: string) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  if (user.role === 'teacher' || user.role === 'TEACHER') {
    const unitOwned = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        class: true,
        vocabItems: {
          orderBy: { sortOrder: 'asc' },
        },
        studentProgress: {
          where: { userId: user.id },
        },
        exams: {
          orderBy: { createdAt: 'asc' },
          include: {
            results: {
              where: { studentId: user.id },
            },
          },
        },
      },
    })
    if (unitOwned && unitOwned.class.teacherId === user.id) {
      // Sanitize for student view
      const exams = unitOwned.exams || []
      return { ...unitOwned, exams: sanitizeExams(exams) }
    }
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      class: {
        include: {
          students: {
            where: { studentId: user.id, status: 'active' },
          },
        },
      },
      vocabItems: {
        orderBy: { sortOrder: 'asc' },
      },
      studentProgress: {
        where: { userId: user.id },
      },
      exams: {
        where: { isPublished: true, isEnabled: true },
        orderBy: { createdAt: 'asc' },
        include: {
          results: {
            where: { studentId: user.id },
          },
        },
      },
    },
  })

  if (!unit || unit.class.students.length === 0 || !unit.isPublished) {
    throw new Error('Unauthorized or Unit not published')
  }

  // Sanitize test content to prevent students from cheating
  const exams = unit.exams || []
  return { ...unit, exams: sanitizeExams(exams) }
}

export async function updateUnitInfo(unitId: string, title: string, description?: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  await prisma.unit.update({
    where: { id: unitId },
    data: {
      title: title.trim(),
      description: description?.trim() || '',
    },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  return { success: true }
}

export async function updateUnitExams(unitId: string, examsData: any[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // We should not delete all exams because ExamResult would be lost.
  // Instead, we will iterate and upsert them. 
  // Any exam removed from the array that has no results could be deleted, but for simplicity we can just leave it or mark it disabled.
  for (const exam of examsData) {
    if (exam.id.startsWith('temp-') || !exam.id) {
      await prisma.exam.create({
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          content: exam.content || exam.blocks,
          unitId: unit.id,
        }
      });
    } else {
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          content: exam.content || exam.blocks,
        }
      });
    }
  }

  const updatedUnit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { exams: { orderBy: { createdAt: 'asc' } } }
  });

  revalidatePath(`/teacher/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true, exams: updatedUnit?.exams || [] }
}

export async function deleteUnitExam(examId: string, unitId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // Check if it's a real ID from DB and delete it. 
  // It cascades and deletes ExamResult due to schema relations.
  if (examId && !examId.startsWith('temp-')) {
    await prisma.exam.delete({
      where: { id: examId }
    })
  }

  const updatedUnit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { exams: { orderBy: { createdAt: 'asc' } } }
  });

  revalidatePath(`/teacher/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true, exams: updatedUnit?.exams || [] }
}

export async function updateClassExams(classId: string, examsData: any[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  for (const exam of examsData) {
    if (exam.id.startsWith('temp-') || !exam.id) {
      await prisma.exam.create({
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          content: exam.content || exam.blocks,
          classId: targetClass.id,
          unitId: null,
        }
      })
    } else {
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          content: exam.content || exam.blocks,
        }
      })
    }
  }

  const updatedClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      exams: {
        where: { unitId: null },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  revalidatePath(`/teacher/classes/${classId}`)
  revalidatePath(`/student/classes/${classId}`)
  return { success: true, exams: updatedClass?.exams || [] }
}

export async function deleteClassExam(examId: string, classId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  if (examId && !examId.startsWith('temp-')) {
    await prisma.exam.delete({
      where: { id: examId }
    })
  }

  const updatedClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      exams: {
        where: { unitId: null },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  revalidatePath(`/teacher/classes/${classId}`)
  revalidatePath(`/student/classes/${classId}`)
  return { success: true, exams: updatedClass?.exams || [] }
}
