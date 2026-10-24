import { NextRequest, NextResponse } from 'next/server'

// Map locale codes sang mã ngôn ngữ chuẩn của Google TTS
const LANG_MAP: Record<string, string> = {
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh': 'zh-CN',
  'ja-jp': 'ja',
  'ja': 'ja',
  'ko-kr': 'ko',
  'ko': 'ko',
  'fr-fr': 'fr',
  'fr': 'fr',
  'de-de': 'de',
  'de': 'de',
  'es-es': 'es',
  'es': 'es',
  'ru-ru': 'ru',
  'ru': 'ru',
  'vi-vn': 'vi',
  'vi': 'vi',
  'en-us': 'en',
  'en-gb': 'en',
  'en': 'en',
}

const KOREAN_CHAR_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

/**
 * Lấy giọng đọc nữ tiếng Hàn chuẩn phổ thông (Seoul) từ Naver Voice (Kyuri / Mijin).
 * Giọng Kyuri là giọng nữ trẻ trung, trong trẻo, cao và tự nhiên, chuẩn Seoul.
 */
async function fetchKoreanFemaleVoice(text: string): Promise<ArrayBuffer | null> {
  const speakers = ['kyuri', 'mijin']
  for (const speaker of speakers) {
    try {
      const naverUrl = `https://dict.naver.com/api/nvoice?service=dictionary&speech_fmt=mp3&speaker=${speaker}&speed=0&text=${encodeURIComponent(
        text
      )}`
      const res = await fetch(naverUrl, {
        headers: {
          ...BROWSER_HEADERS,
          Referer: 'https://papago.naver.com/',
        },
        signal: AbortSignal.timeout(4500),
      })

      if (res.ok) {
        const buffer = await res.arrayBuffer()
        if (buffer.byteLength > 200) {
          return buffer
        }
      }
    } catch (err) {
      console.warn(`Naver TTS failed for speaker ${speaker}:`, err)
    }
  }
  return null
}

/**
 * Lấy giọng đọc từ Google Translate TTS (chuẩn cho Trung, Nhật, Anh, Pháp, Đức, TBN...)
 */
async function fetchGoogleVoice(text: string, targetLang: string): Promise<ArrayBuffer | null> {
  try {
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${targetLang}&client=tw-ob`
    const res = await fetch(googleTtsUrl, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      const buffer = await res.arrayBuffer()
      if (buffer.byteLength > 100) {
        return buffer
      }
    }
  } catch (err) {
    console.error('Google TTS fetch error:', err)
  }
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')?.trim()
  const lang = searchParams.get('lang')?.toLowerCase().replace('_', '-') || 'en'

  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 })
  }

  // Giới hạn độ dài tránh lạm dụng
  const safeText = text.slice(0, 300)
  const targetLang = LANG_MAP[lang] || LANG_MAP[lang.split('-')[0]] || 'en'
  const isKorean = targetLang === 'ko' || lang.startsWith('ko') || KOREAN_CHAR_REGEX.test(safeText)

  try {
    let audioBuffer: ArrayBuffer | null = null

    // Nếu là tiếng Hàn, ưu tiên giọng nữ phổ thông chuẩn (Naver Kyuri)
    if (isKorean) {
      audioBuffer = await fetchKoreanFemaleVoice(safeText)
    }

    // Nếu không phải tiếng Hàn hoặc Naver không khả dụng, sử dụng Google TTS
    if (!audioBuffer) {
      audioBuffer = await fetchGoogleVoice(safeText, targetLang)
    }

    if (!audioBuffer) {
      return new NextResponse('Failed to fetch TTS audio', { status: 502 })
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error fetching TTS audio:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

