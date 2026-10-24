import { useState, useRef, useEffect, DragEvent } from 'react'
import { Plus, Save, Sparkles, UploadCloud, Image as ImageIcon, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'

import { VocabItemData } from '../../types'
import { getMediaUrl } from '~/common/utils/media'

interface ManualImportProps {
  editingItem: VocabItemData | null
  onSave: (item: VocabItemData) => void
  onCancelEdit: () => void
}

const initialFormState = {
  word: '',
  vi: '',
  ipa: '',
  pos: '',
  emoji: '',
  image: '',
  example: '',
  exampleVi: '',
  tip: '',
}

const ManualImport = ({ editingItem, onSave, onCancelEdit }: ManualImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState(() => {
    if (editingItem) {
      return {
        word: editingItem.word,
        vi: editingItem.vi,
        ipa: editingItem.ipa || '',
        pos: editingItem.pos || '',
        emoji: editingItem.emoji || '',
        image: editingItem.image || '',
        example: editingItem.example || '',
        exampleVi: editingItem.exampleVi || '',
        tip: editingItem.tip || '',
      }
    }
    return initialFormState
  })

  const [showAdvanced, setShowAdvanced] = useState(() => {
    if (editingItem) {
      return !!(
        editingItem.image ||
        editingItem.ipa ||
        editingItem.pos ||
        editingItem.emoji ||
        editingItem.example ||
        editingItem.exampleVi ||
        editingItem.tip
      )
    }
    return false
  })

  // Deferred Upload States
  const [pendingFile, setPendingFile] = useState<File | null>(() => editingItem?.pendingFile || null)
  const objectUrlRef = useRef<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadInfo, setUploadInfo] = useState<{ size: number; originalSize: number } | null>(() => {
    if (editingItem?.pendingFile) {
      return { size: editingItem.pendingFile.size, originalSize: editingItem.pendingFile.size }
    }
    return null
  })
  const [isCleaningOrphans, setIsCleaningOrphans] = useState(false)
  const [storageStats, setStorageStats] = useState<{
    fileCount: number
    totalFormatted: string
    remainingFormatted: string
  } | null>(null)

  // Thu hồi Object URL khi unmount để tránh rò rỉ RAM
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const fetchStorageStats = () => {
    fetch('/api/upload/vocab-image')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStorageStats({
            fileCount: data.fileCount,
            totalFormatted: data.totalFormatted,
            remainingFormatted: data.remainingFormatted,
          })
        }
      })
      .catch(() => {})
  }

  // Tải thông tin dung lượng kho Supabase khi mở mục nâng cao
  useEffect(() => {
    if (!showAdvanced) return
    fetchStorageStats()
  }, [showAdvanced])

  const handleCleanOrphans = async () => {
    if (!confirm('Hệ thống sẽ quét và xóa các ảnh trên kho lưu trữ mà không còn thuộc về từ vựng nào trong cơ sở dữ liệu. Bạn có chắc không?')) {
      return
    }
    setIsCleaningOrphans(true)
    try {
      const res = await fetch('/api/upload/vocab-image?action=clean-orphans', {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        alert(json.message || `Đã dọn dẹp ${json.cleanedCount} ảnh mồ côi!`)
        fetchStorageStats()
      } else {
        alert(json.error || 'Lỗi khi dọn dẹp ảnh')
      }
    } catch {
      alert('Không thể kết nối tới máy chủ')
    } finally {
      setIsCleaningOrphans(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Xử lý chọn file ảnh cục bộ (Deferred Upload - không tải lên mạng ngay)
  const handleSelectFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ chấp nhận file định dạng hình ảnh (JPG, PNG, WebP...)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Dung lượng file tối đa là 5MB')
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    const previewUrl = URL.createObjectURL(file)
    objectUrlRef.current = previewUrl

    setPendingFile(file)
    setFormData((prev) => ({ ...prev, image: previewUrl }))
    setUploadInfo({ size: file.size, originalSize: file.size })
    setUploadError(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleSelectFile(file)
    }
    // Reset file input để có thể chọn lại cùng 1 file nếu muốn
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleSelectFile(file)
    }
  }

  // Hỗ trợ dán (Ctrl+V) ảnh trực tiếp từ clipboard khi đang mở phần nâng cao
  useEffect(() => {
    const handleGlobalPaste = (e: globalThis.ClipboardEvent) => {
      if (!showAdvanced) return
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            e.preventDefault()
            handleSelectFile(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handleGlobalPaste)
    return () => {
      window.removeEventListener('paste', handleGlobalPaste)
    }
  }, [showAdvanced])

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPendingFile(null)
    setFormData((prev) => ({ ...prev, image: '' }))
    setUploadInfo(null)
    setUploadError(null)
  }

  const handleSave = () => {
    if (!formData.word.trim() || !formData.vi.trim()) return

    onSave({
      id: editingItem?.id || crypto.randomUUID(),
      word: formData.word.trim(),
      vi: formData.vi.trim(),
      ipa: formData.ipa.trim(),
      pos: formData.pos.trim(),
      emoji: formData.emoji.trim(),
      image: formData.image.trim() || null,
      example: formData.example.trim(),
      exampleVi: formData.exampleVi.trim(),
      tip: formData.tip.trim(),
      pendingFile: pendingFile !== undefined ? pendingFile : (editingItem?.pendingFile ?? null),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    })

    if (!editingItem) {
      setFormData(initialFormState)
      setPendingFile(null)
      setUploadInfo(null)
      setUploadError(null)
      objectUrlRef.current = null
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ vựng (Eng) *</label>
          <input
            type="text"
            name="word"
            value={formData.word}
            onChange={handleChange}
            placeholder="VD: account"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Định nghĩa (Vi) *</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="vi"
              value={formData.vi}
              onChange={handleChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="VD: tài khoản"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
            <button
              onClick={handleSave}
              disabled={!formData.word.trim() || !formData.vi.trim()}
              className="bg-[#6A5EEB] hover:bg-[#5b51d8] text-white p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-[0.98]"
            >
              {editingItem ? <Save size={20} /> : <Plus size={20} />}
            </button>
          </div>
        </div>
      </div>

      {editingItem && (
        <div className="flex justify-start">
          <button
            onClick={onCancelEdit}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Hủy chỉnh sửa
          </button>
        </div>
      )}

      {/* Advanced Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-[#6A5EEB] hover:underline flex items-center gap-1"
        >
          <Sparkles size={14} /> {showAdvanced ? 'Ẩn nâng cao' : 'Thêm chi tiết (Hình ảnh, IPA, Ví dụ...)'}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
          {/* UPLOAD HÌNH ẢNH MINH HỌA */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-gray-700 text-xs">
                <ImageIcon size={14} className="text-[#6A5EEB]" />
                Hình ảnh minh họa (Deferred Upload)
              </span>
              <div className="flex items-center gap-2">
                {storageStats && (
                  <span className="text-[11px] text-gray-600 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
                    <span className="font-medium text-gray-700">Kho ảnh: {storageStats.fileCount} ảnh ({storageStats.totalFormatted})</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-600 font-medium">Còn trống {storageStats.remainingFormatted}</span>
                    <span className="text-gray-300">•</span>
                    <button
                      type="button"
                      onClick={handleCleanOrphans}
                      disabled={isCleaningOrphans}
                      className="text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      title="Quét và xóa ảnh mồ côi trên Cloud không còn thuộc về từ vựng nào"
                    >
                      {isCleaningOrphans && <Loader2 size={11} className="animate-spin" />}
                      <span>{isCleaningOrphans ? 'Đang dọn...' : 'Dọn rác'}</span>
                    </button>
                  </span>
                )}
                <span className="text-[11px] text-gray-400 hidden sm:inline">Tối đa 5MB</span>
              </div>
            </div>

            {/* Error message */}
            {uploadError && (
              <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span className="flex-1">{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {formData.image ? (
              /* Đã có ảnh: Preview thumbnail kèm nút thao tác */
              <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0 shadow-inner group/img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getMediaUrl(formData.image)}
                    alt="Vocab illustration"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {pendingFile ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ⚡ Ảnh mới (Tải lên khi lưu bài học)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ✓ Đã lưu trên Cloud
                      </span>
                    )}
                    {uploadInfo && (
                      <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {(uploadInfo.size / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono truncate mt-1" title={formData.image}>
                    {pendingFile ? (pendingFile.name || 'Ảnh mới chọn') : formData.image}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {pendingFile
                      ? 'Ảnh sẽ tự động nén WebP và tải lên Supabase Storage khi bạn nhấn "Lưu thay đổi".'
                      : 'Ảnh đã được tối ưu hóa WebP và lưu trữ an toàn.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    title="Chọn ảnh khác thay thế"
                  >
                    <RefreshCw size={13} />
                    <span>Thay ảnh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa ảnh này"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* Chưa có ảnh: Khu vực Dropzone */
              <div
                ref={dropzoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#6A5EEB] bg-[#6A5EEB]/10 scale-[1.01]'
                    : 'border-gray-300 hover:border-[#6A5EEB] bg-white/80 hover:bg-[#6A5EEB]/5'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-2 text-gray-500 group">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#6A5EEB] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <UploadCloud size={20} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">
                    Kéo thả ảnh vào đây, hoặc <span className="text-[#6A5EEB] underline font-semibold">chọn từ máy tính</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Chỉ tải lên khi lưu • Tự động nén WebP ~30KB • Hỗ trợ <kbd className="px-1 py-0.5 text-[10px] bg-gray-100 border border-gray-200 rounded">Ctrl+V</kbd> để dán ảnh
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phát âm (IPA)</label>
            <input
              type="text"
              name="ipa"
              value={formData.ipa}
              onChange={handleChange}
              placeholder="/əˈkaʊnt/"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Loại từ (POS)</label>
            <input
              type="text"
              name="pos"
              value={formData.pos}
              onChange={handleChange}
              placeholder="n, v, adj..."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Emoji</label>
            <input
              type="text"
              name="emoji"
              value={formData.emoji}
              onChange={handleChange}
              placeholder="📱"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Mẹo nhớ (Tip)</label>
            <input
              type="text"
              name="tip"
              value={formData.tip}
              onChange={handleChange}
              placeholder="💡 Cụm từ hay gặp: social media account..."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Câu ví dụ (Eng)</label>
            <input
              type="text"
              name="example"
              value={formData.example}
              onChange={handleChange}
              placeholder="Don't share your account password."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nghĩa câu ví dụ (Vi)
            </label>
            <input
              type="text"
              name="exampleVi"
              value={formData.exampleVi}
              onChange={handleChange}
              placeholder="Đừng chia sẻ mật khẩu tài khoản."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ManualImport
