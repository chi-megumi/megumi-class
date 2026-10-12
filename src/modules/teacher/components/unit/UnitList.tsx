'use client'

import { BookOpen, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { CreateClassFormValues } from '~/app/teacher/classes/create/page'

const UnitList = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CreateClassFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'units',
  })

  return (
    <div className="xl:absolute xl:inset-0 bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col h-[600px] xl:h-auto">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="bg-orange-100 p-1.5 rounded-lg text-orange-500">
            <BookOpen size={18} />
          </span>
          Chương trình học (Units)
        </h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          {fields.length} Bài học
        </span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4 custom-scrollbar">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-all group animate-in slide-in-from-top-2 fade-in duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#6A5EEB] flex items-center justify-center font-bold text-sm shrink-0">
              {index + 1}
            </div>
            <div className="flex-1">
              <input
                {...register(`units.${index}.name` as const)}
                type="text"
                placeholder={`Tên bài học ${index + 1} (vd: Family Life)`}
                className="w-full text-base font-medium text-gray-800 bg-transparent outline-none border-b border-transparent focus:border-[#6A5EEB] pb-1 transition-colors placeholder:text-gray-300"
              />
              {errors.units?.[index]?.name && (
                <p className="text-red-500 text-xs mt-1">{errors.units[index].name?.message}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-gray-400 hover:text-[#6A5EEB] bg-gray-50 hover:bg-[#6A5EEB]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#6A5EEB]/20"
                >
                  <Plus size={14} /> Thêm từ vựng (Sẽ cập nhật sau)
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className={`p-2 rounded-xl transition-all ${fields.length === 1 ? 'opacity-30 cursor-not-allowed' : 'text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'}`}
              title="Xoá bài học"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ name: '' })}
          className="w-full py-4 mt-2 border-2 border-dashed border-[#E5D9F2] hover:border-[#6A5EEB] rounded-2xl text-[#6A5EEB] font-medium flex items-center justify-center gap-2 transition-all hover:bg-[#6A5EEB]/5 hover:shadow-sm"
        >
          <Plus size={20} />
          Thêm Unit mới
        </button>
      </div>
    </div>
  )
}

export default UnitList
