import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdmin: SupabaseClient | null = null

/**
 * Khởi tạo client Supabase với quyền Service Role (chỉ dùng phía Server)
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceRoleKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY trong file .env hoặc .env.local! Vui lòng vào Supabase Dashboard > Project Settings > API > lấy secret key "service_role" và dán vào file .env',
    )
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseAdmin
}

export const VOCAB_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'vocab-images'

/**
 * Tải file ảnh buffer lên Supabase Storage bucket
 */
export async function uploadVocabImage(buffer: Buffer, fileKey: string) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from(VOCAB_STORAGE_BUCKET)
    .upload(fileKey, buffer, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 năm
      upsert: true,
    })

  if (error) {
    console.error('Supabase upload error:', error)
    throw new Error(`Lỗi khi tải ảnh lên kho lưu trữ: ${error.message}`)
  }

  return { path: data.path || fileKey }
}

/**
 * Trích xuất relative storage key từ path hoặc full URL Supabase
 */
export function extractStorageKey(pathOrUrl: string): string | null {
  if (!pathOrUrl) return null
  let clean = pathOrUrl.trim()
  if (clean.startsWith('data:')) return null

  // Nếu là URL đầy đủ chứa tên bucket
  const bucketMarker = `/${VOCAB_STORAGE_BUCKET}/`
  if (clean.includes(bucketMarker)) {
    clean = clean.substring(clean.indexOf(bucketMarker) + bucketMarker.length)
  }

  // Nếu là URL bên ngoài (Google, Unsplash, v.v.) thì không được xóa
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return null
  }

  // Loại bỏ các dấu gạch chéo ở đầu
  clean = clean.replace(/^\/+/, '')
  return clean || null
}

/**
 * Xóa danh sách ảnh cũ khỏi Supabase Storage (được gọi khi sửa/xóa từ vựng)
 */
export async function deleteVocabImages(paths: string[]) {
  if (!paths || paths.length === 0) return { success: true, count: 0 }

  const validKeys = paths
    .map((p) => extractStorageKey(p))
    .filter((p): p is string => Boolean(p))

  if (validKeys.length === 0) return { success: true, count: 0 }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage.from(VOCAB_STORAGE_BUCKET).remove(validKeys)
    if (error) {
      console.warn('Cảnh báo khi dọn dẹp ảnh cũ trên Supabase:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, count: validKeys.length, data }
  } catch (err: unknown) {
    console.warn('Bỏ qua lỗi xóa ảnh (có thể do chưa cấu hình key storage):', err)
    return { success: false, error: String(err) }
  }
}

