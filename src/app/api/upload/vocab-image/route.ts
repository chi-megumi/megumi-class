import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { getMe } from '@/actions/auth'
import { uploadVocabImage, deleteVocabImages } from '~/common/libs/supabase-storage'

// Giới hạn dung lượng tải lên ban đầu: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    // 1. Xác thực quyền giáo viên / admin
    const user = await getMe()
    if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER' && user.systemRole !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thực hiện chức năng này.' },
        { status: 401 },
      )
    }

    // 2. Đọc file từ FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp file hình ảnh.' },
        { status: 400 },
      )
    }

    // 3. Kiểm tra định dạng
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Chỉ chấp nhận file định dạng hình ảnh (JPG, PNG, WebP...)' },
        { status: 400 },
      )
    }

    // 4. Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh vượt quá giới hạn 5MB.' },
        { status: 400 },
      )
    }

    // 5. Nén và chuẩn hóa ảnh bằng Sharp
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Fit inside 500x500 giữ nguyên tỉ lệ gốc, auto-rotate theo EXIF, nén sang .webp chất lượng 80
    const webpBuffer = await sharp(inputBuffer)
      .rotate()
      .resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80, effort: 4 })
      .toBuffer()

    // 6. Tạo đường dẫn file tương đối
    const fileKey = `vocab/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`

    // 7. Lưu trữ lên Supabase Storage
    const result = await uploadVocabImage(webpBuffer, fileKey)

    return NextResponse.json({
      success: true,
      path: result.path,
      size: webpBuffer.length,
      originalSize: file.size,
    })
  } catch (error: unknown) {
    console.error('Lỗi API upload vocab-image:', error)
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống khi tải ảnh lên.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getMe()
    if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER' && user.systemRole !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { getSupabaseAdmin, VOCAB_STORAGE_BUCKET } = await import('~/common/libs/supabase-storage')
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(VOCAB_STORAGE_BUCKET)
      .list('vocab', { limit: 1000 })

    if (error) {
      throw error
    }

    const files = (data || []).filter((f) => f.name && !f.name.startsWith('.'))
    const totalBytes = files.reduce((acc, f) => acc + (f.metadata?.size || 0), 0)
    const totalLimitBytes = 1024 * 1024 * 1024 // 1 GB
    const remainingBytes = Math.max(0, totalLimitBytes - totalBytes)

    return NextResponse.json({
      success: true,
      fileCount: files.length,
      totalBytes,
      totalFormatted:
        totalBytes > 1024 * 1024
          ? (totalBytes / (1024 * 1024)).toFixed(2) + ' MB'
          : (totalBytes / 1024).toFixed(1) + ' KB',
      remainingBytes,
      remainingFormatted: (remainingBytes / (1024 * 1024)).toFixed(2) + ' MB',
      percentUsed: ((totalBytes / totalLimitBytes) * 100).toFixed(3),
    })
  } catch (error: unknown) {
    console.error('Lỗi API lấy dung lượng storage:', error)
    const message = error instanceof Error ? error.message : 'Lỗi lấy thống kê kho lưu trữ.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getMe()
    if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER' && user.systemRole !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thực hiện chức năng này.' },
        { status: 401 },
      )
    }

    const url = new URL(request.url)
    if (url.searchParams.get('action') === 'clean-orphans') {
      const { getSupabaseAdmin, VOCAB_STORAGE_BUCKET } = await import('~/common/libs/supabase-storage')
      const supabase = getSupabaseAdmin()

      // 1. Lấy danh sách toàn bộ file trong thư mục vocab trên bucket
      const { data, error } = await supabase.storage.from(VOCAB_STORAGE_BUCKET).list('vocab', { limit: 1000 })
      if (error) throw error

      const files = (data || []).filter((f) => f.name && !f.name.startsWith('.'))
      const storageFileKeys = files.map((f) => `vocab/${f.name}`)

      // 2. Lấy danh sách ảnh đang được dùng trong database
      const { prisma } = await import('~/common/libs/prisma')
      const existingVocabs = await prisma.vocabItem.findMany({
        where: { image: { not: null } },
        select: { image: true },
      })
      const activeImages = new Set(existingVocabs.map((v) => v.image).filter(Boolean) as string[])

      // 3. Lọc ra các file trên storage mà không có bản ghi nào trong database trỏ tới
      const orphanKeys = storageFileKeys.filter((k) => !activeImages.has(k))

      if (orphanKeys.length > 0) {
        await deleteVocabImages(orphanKeys)
      }

      return NextResponse.json({
        success: true,
        cleanedCount: orphanKeys.length,
        message: `Đã dọn dẹp ${orphanKeys.length} file ảnh mồ côi.`,
      })
    }

    const body = await request.json().catch(() => ({}))
    const rawPaths: string[] = []

    if (typeof body.path === 'string' && body.path.trim()) {
      rawPaths.push(body.path.trim())
    }
    if (Array.isArray(body.paths)) {
      body.paths.forEach((p: unknown) => {
        if (typeof p === 'string' && p.trim()) {
          rawPaths.push(p.trim())
        }
      })
    }

    if (rawPaths.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đường dẫn ảnh để xóa.' },
        { status: 400 },
      )
    }

    const result = await deleteVocabImages(rawPaths)

    return NextResponse.json({
      success: true,
      deletedCount: result?.count ?? rawPaths.length,
    })
  } catch (error: unknown) {
    console.error('Lỗi API xóa vocab-image:', error)
    const message = error instanceof Error ? error.message : 'Lỗi hệ thống khi xóa ảnh.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}


