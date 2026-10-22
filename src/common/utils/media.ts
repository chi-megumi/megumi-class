/**
 * Ghép relative path với Storage URL cấu hình từ ENV (NEXT_PUBLIC_IMAGE_STORAGE_URL)
 * Hỗ trợ chuyển đổi CDN linh hoạt mà không cần đổi database.
 * 
 * @param path Đường dẫn tương đối (ví dụ: "vocab/1729584000-abc.webp") hoặc URL tuyệt đối
 * @returns Full URL sẵn sàng để hiển thị thẻ <img src={...} />
 */
export function getMediaUrl(path?: string | null): string {
  if (!path) return ''

  // Nếu path đã là URL tuyệt đối hoặc base64/blob thì giữ nguyên
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('/') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_STORAGE_URL || ''
  if (!baseUrl) return path

  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
