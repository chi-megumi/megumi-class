import { useCallback, useEffect, useRef, useState } from 'react'

const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/
const JAPANESE_KANA_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/
const CHINESE_CHAR_REGEX = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/
const PINYIN_REGEX = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i
const CYRILLIC_REGEX = /[\u0400-\u04FF]/
const GERMAN_SPECIFIC_REGEX = /[ßÄÖÜäöü]/
const FRENCH_SPECIFIC_REGEX = /[œæçÇ]/i
const SPANISH_SPECIFIC_REGEX = /[ñÑ¿¡]/

/**
 * Tự động xác định ngôn ngữ phù hợp dựa trên nội dung text:
 * - Ký tự Hangul -> 'ko-KR' (tiếng Hàn)
 * - Ký tự Hiragana/Katakana -> 'ja-JP' (tiếng Nhật)
 * - Chữ Hán hoặc Pinyin có dấu thanh -> 'zh-CN' (tiếng Trung)
 * - Chữ Cyrillic -> 'ru-RU' (tiếng Nga)
 * - Ký tự đặc thù tiếng Đức (ß, ä, ö, ü) -> 'de-DE' (tiếng Đức)
 * - Ký tự đặc thù tiếng Pháp (ç, œ, æ) -> 'fr-FR' (tiếng Pháp)
 * - Ký tự đặc thù tiếng Tây Ban Nha (ñ, ¿, ¡) -> 'es-ES' (tiếng TBN)
 * - Mặc định còn lại -> 'en-US' (tiếng Anh)
 */
function detectLanguage(text: string): string {
  if (KOREAN_REGEX.test(text)) return 'ko-KR'
  if (JAPANESE_KANA_REGEX.test(text)) return 'ja-JP'
  if (CHINESE_CHAR_REGEX.test(text) || PINYIN_REGEX.test(text)) return 'zh-CN'
  if (CYRILLIC_REGEX.test(text)) return 'ru-RU'
  if (GERMAN_SPECIFIC_REGEX.test(text)) return 'de-DE'
  if (FRENCH_SPECIFIC_REGEX.test(text)) return 'fr-FR'
  if (SPANISH_SPECIFIC_REGEX.test(text)) return 'es-ES'
  return 'en-US'
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fallbackUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Dọn dẹp audio khi component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakWithBrowserTts = useCallback((cleanText: string, targetLang: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false)
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = targetLang
      const isAsian = ['zh', 'ja', 'ko'].includes(targetLang.split('-')[0])
      utterance.rate = isAsian ? 0.88 : 0.9
      utterance.pitch = 1.15

      const voices = window.speechSynthesis.getVoices() || []
      const prefix = targetLang.toLowerCase().split('-')[0]
      // Ưu tiên chọn giọng nữ phổ thông chuẩn (Kyuri, Yuna, Sora, Kyoko, Tingting, Samantha, etc.)
      const matchedVoice =
        voices.find(
          (v) =>
            v.lang.toLowerCase().replace('_', '-').startsWith(prefix) &&
            /female|yuna|sora|kyoko|tingting|meijia|samantha|zira|victoria|karen/i.test(v.name)
        ) ||
        voices.find((v) =>
          v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
        )
      if (matchedVoice) {
        utterance.voice = matchedVoice
        utterance.lang = matchedVoice.lang
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      fallbackUtteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }, [])

  const speak = useCallback(
    (text: string, customLang?: string) => {
      if (typeof window === 'undefined') return

      // Loại bỏ ký tự slash thừa nếu truyền IPA/Pinyin dạng /nǐ/
      const cleanText = text.replace(/^\/+|\/+$/g, '').trim()
      if (!cleanText) return

      // Dừng âm thanh đang phát
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      // Tự động nhận diện ngôn ngữ
      const autoLang = detectLanguage(cleanText)
      const targetLang =
        customLang && customLang !== 'auto'
          ? customLang === 'en-US' && autoLang !== 'en-US'
            ? autoLang
            : customLang
          : autoLang

      // Ưu tiên 1: Sử dụng /api/tts (Giọng nữ chuẩn, gắn version tag để xóa triệt để cache cũ trên trình duyệt)
      try {
        const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(
          targetLang
        )}&v=v2_kyuri`
        const audio = new Audio(audioUrl)
        audioRef.current = audio

        audio.onplay = () => setIsSpeaking(true)
        audio.onended = () => {
          setIsSpeaking(false)
          audioRef.current = null
        }
        audio.onerror = () => {
          console.warn('TTS API error, falling back to Browser Web Speech API')
          audioRef.current = null
          speakWithBrowserTts(cleanText, targetLang)
        }

        audio.play().catch((err) => {
          console.warn('Audio play failed, falling back to Browser Web Speech API:', err)
          audioRef.current = null
          speakWithBrowserTts(cleanText, targetLang)
        })
      } catch {
        speakWithBrowserTts(cleanText, targetLang)
      }
    },
    [speakWithBrowserTts]
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking }
}
