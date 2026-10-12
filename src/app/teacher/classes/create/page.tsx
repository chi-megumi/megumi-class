'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '~/components/button/Button'
import ClassInfoForm from '~/modules/teacher/components/ClassInfoForm'
import UnitList from '~/modules/teacher/components/unit/UnitList'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClassAction } from '~/actions/class'

const createClassSchema = z.object({
  name: z.string().min(1, 'Tên lớp học là bắt buộc'),
  description: z.string().optional(),
  inviteCode: z.string().optional(),
  units: z.array(z.object({ name: z.string() })).min(1),
  studentIds: z.array(z.string()).optional(),
})

export type CreateClassFormValues = z.infer<typeof createClassSchema>

export default function CreateClassPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: '',
      description: '',
      inviteCode: '',
      units: [{ name: '' }],
    },
  })

  const onSubmit = async (data: CreateClassFormValues) => {
    try {
      setIsSubmitting(true)
      const res = await createClassAction(data)
      if (res.success) {
        alert('🎉 Tạo lớp học thành công!')
        router.push('/')
      }
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra, vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="pb-10 pt-4 animate-in fade-in duration-500"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 cursor-pointer hover:bg-white rounded-full transition-colors shadow-sm hover:shadow text-gray-500 hover:text-[#6A5EEB] bg-white/50"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tạo Lớp Học Mới</h1>
              <p className="text-gray-500 mt-1">
                Thiết lập không gian lớp học và chương trình giảng dạy của bạn.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Cột Trái: Thông tin lớp học */}
            <div className="xl:col-span-7 space-y-6">
              <ClassInfoForm />
            </div>

            {/* Cột Phải: Units */}
            <div className="xl:col-span-5 xl:relative">
              <UnitList />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              className="px-8 !bg-white hover:!bg-gray-50 text-gray-600 shadow-sm border border-gray-200"
              onClick={() => router.back()}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="px-10 shadow-[0_4px_15px_rgba(106,94,235,0.4)] hover:shadow-[0_6px_20px_rgba(106,94,235,0.6)] hover:-translate-y-0.5 transition-all"
            >
              {isSubmitting ? 'Đang lưu...' : 'Tạo Lớp Học'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
