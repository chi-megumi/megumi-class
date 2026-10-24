import type { ReadingQuestionExtended, ReadingQuestionKind } from './types'

export interface ParsedReadingPassage {
  title?: string
  text: string
  questions: ReadingQuestionExtended[]
}

export interface ReadingJsonValidationResult {
  isValid: boolean
  error: string | null
  title?: string
  text: string
  questions: ReadingQuestionExtended[]
  passages?: ParsedReadingPassage[]
}

/**
 * Loại bỏ markdown code blocks (```json ... ```) và khoảng trắng thừa nếu AI trả về kèm markdown.
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim()

  // 1. Trường hợp bao bọc bởi ```json ... ``` hoặc ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?```\s*$/, '').trim()
  } else {
    // 2. Tìm khối code markdown nằm giữa đoạn văn
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleaned = codeBlockMatch[1].trim()
    } else {
      // 3. Trích xuất khoảng JSON từ { ... } hoặc [ ... ] ngoài cùng
      const firstCurly = cleaned.indexOf('{')
      const lastCurly = cleaned.lastIndexOf('}')
      const firstSquare = cleaned.indexOf('[')
      const lastSquare = cleaned.lastIndexOf(']')

      if (firstCurly !== -1 && lastCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        if (lastCurly > firstCurly) {
          cleaned = cleaned.slice(firstCurly, lastCurly + 1)
        }
      } else if (firstSquare !== -1 && lastSquare !== -1 && lastSquare > firstSquare) {
        cleaned = cleaned.slice(firstSquare, lastSquare + 1)
      }
    }
  }

  return cleaned
}

/**
 * Chuẩn hóa danh sách câu hỏi đọc hiểu từ JSON.
 * Tự động nhận diện và bảo toàn chính xác loại câu hỏi (kind), đáp án, giải thích, và câu chèn.
 */
function parseQuestionsList(rawQuestions: unknown[]): ReadingQuestionExtended[] {
  const validKinds: ReadingQuestionKind[] = [
    'multiple_choice',
    'true_false',
    'cloze_choice',
    'cloze_text',
    'matching_heading',
    'sentence_insertion',
    'short_answer',
  ]

  return rawQuestions.map((item, idx) => {
    const it = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>

    const id = typeof it.id === 'string' && it.id.trim() ? it.id : crypto.randomUUID()
    const text =
      typeof it.text === 'string' && it.text.trim()
        ? it.text
        : typeof it.question === 'string' && it.question.trim()
          ? it.question
          : `Câu ${idx + 1}:`

    // Xử lý danh sách lựa chọn
    let options: string[] | undefined
    if (Array.isArray(it.options)) {
      options = it.options.map(String)
    } else if (Array.isArray(it.choices)) {
      options = it.choices.map(String)
    }

    // Xử lý correctIndex linh hoạt (hỗ trợ số, chuỗi số, hoặc chữ cái A/B/C/D)
    let correctIndex = 0
    if (typeof it.correctIndex === 'number') {
      correctIndex = it.correctIndex
    } else if (typeof it.correctIndex === 'string') {
      const parsedNum = parseInt(it.correctIndex, 10)
      if (!isNaN(parsedNum)) correctIndex = parsedNum
    } else if (typeof it.correctAnswer === 'string' && options) {
      const matchIdx = options.findIndex(
        (opt) => opt.trim().toLowerCase() === String(it.correctAnswer).trim().toLowerCase()
      )
      if (matchIdx !== -1) {
        correctIndex = matchIdx
      } else {
        const letter = it.correctAnswer.trim().toUpperCase()
        const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 }
        if (letterMap[letter] !== undefined) correctIndex = letterMap[letter]
      }
    }

    // Đáp án tự gõ cho Short Answer
    let answer: string | undefined
    if (typeof it.answer === 'string') {
      answer = it.answer
    } else if (typeof it.correctAnswer === 'string' && (!options || options.length === 0)) {
      answer = it.correctAnswer
    }

    // Câu văn cần chèn cho dạng Sentence Insertion
    const sentence = typeof it.sentence === 'string' ? it.sentence : undefined

    // Giải thích dẫn chứng
    const explanation =
      typeof it.explanation === 'string'
        ? it.explanation
        : typeof it.explain === 'string'
          ? it.explain
          : undefined

    // Nhận diện loại câu hỏi (kind)
    let kind: ReadingQuestionKind = 'multiple_choice'
    const rawKind = typeof it.kind === 'string' ? it.kind.toLowerCase() : ''

    if (validKinds.includes(rawKind as ReadingQuestionKind)) {
      kind = rawKind as ReadingQuestionKind
    } else if (sentence) {
      kind = 'sentence_insertion'
    } else if (answer && (!options || options.length === 0)) {
      kind = 'short_answer'
    } else if (options && options.length === 3 && options.includes('Not Given')) {
      kind = 'true_false'
    } else if (
      options &&
      options.length === 2 &&
      (options.includes('True') || options.includes('Đúng'))
    ) {
      kind = 'true_false'
    } else if (
      options &&
      options.some((opt) => opt.startsWith('Heading') || opt.startsWith('Paragraph'))
    ) {
      kind = 'matching_heading'
    } else if (text.toLowerCase().includes('đục lỗ') || text.includes('______')) {
      kind = 'cloze_choice'
    }

    return {
      id,
      text,
      kind,
      options,
      correctIndex,
      answer,
      sentence,
      explanation,
    }
  })
}

/**
 * Phân tích và kiểm tra cú pháp JSON cho bài đọc hiểu và danh sách câu hỏi.
 * Hỗ trợ cả 2 định dạng:
 * 1. Đơn bài: { title: "...", text: "...", questions: [...] } hoặc [ ...questions ]
 * 2. Đa bài: { passages: [ { title: "...", text: "...", questions: [...] } ] }
 */
export function validateReadingJson(rawInput: string): ReadingJsonValidationResult {
  const cleaned = cleanJsonString(rawInput)
  if (!cleaned) {
    return { isValid: false, error: null, text: '', questions: [] }
  }

  try {
    let parsed: unknown = JSON.parse(cleaned)
    let title: string | undefined
    let text = ''
    let questions: ReadingQuestionExtended[] = []
    let multiPassages: ParsedReadingPassage[] | undefined

    if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as Record<string, unknown>

      if (typeof obj.title === 'string' && obj.title.trim()) {
        title = obj.title.trim()
      }

      // Hỗ trợ cấu trúc đa bài đọc { passages: [...] }
      if (Array.isArray(obj.passages) && obj.passages.length > 0) {
        multiPassages = obj.passages.map((p, pIdx) => {
          const pObj = (typeof p === 'object' && p !== null ? p : {}) as Record<string, unknown>
          const pText =
            typeof pObj.text === 'string'
              ? pObj.text
              : typeof pObj.passage === 'string'
                ? pObj.passage
                : typeof pObj.content === 'string'
                  ? pObj.content
                  : ''
          const pTitle =
            typeof pObj.title === 'string' && pObj.title.trim()
              ? pObj.title.trim()
              : `Bài đọc ${pIdx + 1}`
          const pQuestions = Array.isArray(pObj.questions) ? parseQuestionsList(pObj.questions) : []
          return {
            title: pTitle,
            text: pText,
            questions: pQuestions,
          }
        })

        if (multiPassages.length > 0) {
          title = multiPassages[0].title
          text = multiPassages[0].text
          questions = multiPassages[0].questions
        }
      } else {
        if (typeof obj.text === 'string') text = obj.text
        else if (typeof obj.passage === 'string') text = obj.passage
        else if (typeof obj.content === 'string') text = obj.content
        else if (typeof obj.body === 'string') text = obj.body

        if (Array.isArray(obj.questions)) parsed = obj.questions
      }
    }

    if (Array.isArray(parsed)) {
      questions = parseQuestionsList(parsed)
    }

    const hasMulti = multiPassages && multiPassages.length > 0
    if (!text && questions.length === 0 && !hasMulti) {
      return {
        isValid: false,
        error: 'JSON cần chứa trường bài đọc ("text") hoặc danh sách câu hỏi ("questions").',
        text: '',
        questions: [],
      }
    }

    return {
      isValid: true,
      error: null,
      title,
      text,
      questions,
      passages: multiPassages,
    }
  } catch (e) {
    return {
      isValid: false,
      error: `Lỗi cú pháp JSON: ${e instanceof Error ? e.message : String(e)}`,
      text: '',
      questions: [],
    }
  }
}
