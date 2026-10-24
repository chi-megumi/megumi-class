import type { VocabItemData } from '@/modules/teacher/types'
import type { ReadingInteractionType } from './types'

export interface GeneratePromptParams {
  type?: ReadingInteractionType
  types?: ReadingInteractionType[]
  vocabItems?: VocabItemData[]
  unitTitle?: string
  topic?: string
  wordCount?: number
  numQuestions?: number
  numPassages?: number
  targetLevel?: string
}

/**
 * Tạo chỉ thị chi tiết về độ khó, văn phong và đối tượng học sinh cho AI.
 * Phục vụ từ Tiểu học (Starters/Movers/Flyers), THCS, THPT QG cho tới TOEIC và IELTS mọi band điểm.
 */
export function formatTargetLevelRequirement(targetLevel?: string): string {
  if (!targetLevel || !targetLevel.trim()) {
    return 'YÊU CẦU TRÌNH ĐỘ: Tiếng Anh phổ thông chuẩn (B1 - B2).'
  }

  const normalized = targetLevel.toLowerCase().trim()

  // 1. Tiểu học / Primary / A1 / Movers / Starters / Flyers
  if (
    normalized.includes('tiểu học') ||
    normalized.includes('lớp 1') ||
    normalized.includes('lớp 2') ||
    normalized.includes('lớp 3') ||
    normalized.includes('lớp 4') ||
    normalized.includes('lớp 5') ||
    normalized.includes('starter') ||
    normalized.includes('mover') ||
    normalized.includes('flyer') ||
    normalized.includes('a1')
  ) {
    return `YÊU CẦU TRÌNH ĐỘ & ĐỐI TƯỢNG HỌC SINH:
- Mức độ: ${targetLevel}
- Cấu trúc câu: Dùng câu đơn giản, cấu trúc S-V-O ngắn gọn, thì Hiện tại đơn hoặc Quá khứ đơn cơ bản.
- Vốn từ: Chủ đề gần gũi với trẻ em (gia đình, trường học, bạn bè, vật nuôi, sở thích, màu sắc, đồ ăn).
- Tuyệt đối TRÁNH cấu trúc câu phức tạp (mệnh đề quan hệ lồng ghép, đảo ngữ) hoặc từ vựng học thuật trừu tượng.`
  }

  // 2. THCS / Lớp 6-9 / KET / PET / A2 - B1
  if (
    normalized.includes('thcs') ||
    normalized.includes('lớp 6') ||
    normalized.includes('lớp 7') ||
    normalized.includes('lớp 8') ||
    normalized.includes('lớp 9') ||
    normalized.includes('ket') ||
    normalized.includes('pet') ||
    normalized.includes('a2')
  ) {
    return `YÊU CẦU TRÌNH ĐỘ & ĐỐI TƯỢNG HỌC SINH:
- Mức độ: ${targetLevel}
- Cấu trúc câu: Câu ghép và câu phức ở mức độ vừa phải (because, although, if, when, so that).
- Ngữ pháp: Thì quá khứ đơn, hiện tại hoàn thành, tương lai, so sánh, câu điều kiện loại 1.
- Chủ đề: Đời sống thanh thiếu niên, hoạt động ngoại khóa, du lịch, bảo vệ môi trường, công nghệ thường ngày.`
  }

  // 3. THPT / Thi tốt nghiệp THPT Quốc Gia / B1 - B2
  if (
    normalized.includes('thpt') ||
    normalized.includes('tốt nghiệp') ||
    normalized.includes('quốc gia') ||
    normalized.includes('đánh giá năng lực') ||
    normalized.includes('lớp 10') ||
    normalized.includes('lớp 11') ||
    normalized.includes('lớp 12') ||
    normalized.includes('b2')
  ) {
    return `YÊU CẦU TRÌNH ĐỘ & ĐỐI TƯỢNG HỌC SINH:
- Mức độ: ${targetLevel}
- Cấu trúc câu: Chuẩn cấu trúc đề thi Tốt nghiệp THPT / ĐGNL (CEFR B1 - B2). Sử dụng câu phức hợp (mệnh đề quan hệ, câu bị động, câu điều kiện loại 2/3, mệnh đề rút gọn).
- Từ vựng & Câu hỏi: Từ vựng học thuật phổ thông, collocations và phrasal verbs thông dụng. Có các phương án gây nhiễu bẫy chi tiết và kiểm tra khả năng suy luận ngữ cảnh.`
  }

  // 4. TOEIC
  if (normalized.includes('toeic')) {
    return `YÊU CẦU TRÌNH ĐỘ & ĐỐI TƯỢNG HỌC SINH:
- Mức độ: ${targetLevel}
- Bối cảnh: Giao tiếp thương mại, văn phòng công sở quốc tế chuẩn TOEIC Part 7 (emails, memos, announcements, schedules, order inquiries, product notices).
- Từ vựng & Ngữ pháp: Từ vựng chuyên ngành doanh nghiệp (HR, marketing, finance, logistics, customer service).
- Yêu cầu câu hỏi: Bám sát văn phong khảo thí TOEIC, kiểm tra scanning thông tin nhanh, suy luận mục đích người gửi và đối chiếu chi tiết.`
  }

  // 5. IELTS (bao gồm kiểm tra band điểm cụ thể: 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0)
  if (normalized.includes('ielts')) {
    return `YÊU CẦU TRÌNH ĐỘ & ĐỐI TƯỢNG HỌC SINH:
- Mức độ: ${targetLevel}
- Văn phong: Học thuật chuẩn mực IELTS Reading (Academic English tương đương trích đoạn từ Scientific American, National Geographic, The Economist).
- Ngữ pháp & Từ vựng: Cấu trúc câu phức hợp đa tầng (nominalisation, passive voice khách quan, complex relative clauses), vốn từ vựng học thuật phong phú (Academic Word List).
- Độ phân hóa: Đòi hỏi khả năng paraphrase sâu, đối chiếu logic chặt chẽ, nhận diện quan điểm/thái độ tác giả và phân biệt rõ ràng giữa True / False / Not Given.`
  }

  // 6. Tùy chỉnh khác
  return `YÊU CẦU TRÌNH ĐỘ & ĐỐI TƯỢNG HỌC SINH:
- Mức độ mục tiêu: ${targetLevel}
- Yêu cầu: Điều chỉnh độ khó từ vựng, độ phức tạp của câu và nội dung bài đọc sao cho phù hợp chính xác với mức độ "${targetLevel}", đảm bảo câu hỏi có độ phân hóa tốt cho đối tượng này.`
}

/**
 * Tự động tính số lượng câu hỏi tỷ lệ thuận theo độ dài từ vựng.
 * Tỷ lệ chuẩn khảo thí ngôn ngữ: ~50 từ / câu hỏi.
 * Mặc định: 200 từ -> 4 câu hỏi.
 */
export function calculateQuestionsFromWords(words: number): number {
  if (words <= 100) return 2
  return Math.max(2, Math.min(20, Math.round(words / 50)))
}

/**
 * Lấy ngẫu nhiên N từ vựng không trùng lặp từ danh sách (Fisher-Yates sampling).
 * Tham số `_seed` tùy chọn để kích hoạt tính toán lại khi người dùng yêu cầu xáo trộn.
 */
export function getRandomVocabSample(
  items: VocabItemData[],
  maxCount = 25,
  seed?: number
): VocabItemData[] {
  void seed
  if (!items || items.length === 0) return []
  if (items.length <= maxCount) return [...items]

  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, maxCount)
}

export function formatVocabListForPrompt(vocabItems?: VocabItemData[]): string {
  if (!vocabItems || vocabItems.length === 0) {
    return 'Chủ đề tiếng Anh tổng quát phù hợp chương trình học phổ thông.'
  }

  // Nếu danh sách truyền vào lớn hơn 25 từ, lấy ngẫu nhiên 25 từ thay vì cắt cứng 25 từ đầu
  const selectedList = vocabItems.length > 25 ? getRandomVocabSample(vocabItems, 25) : vocabItems

  const items = selectedList
    .map((v) => `${v.word}${v.vi ? ` (${v.vi})` : ''}`)
    .join(', ')

  return `BẮT BUỘC lồng ghép tự nhiên các từ vựng mục tiêu sau đây vào bài đọc:\n${items}`
}

/**
 * Ghép chuỗi phân bổ mục tiêu câu hỏi trắc nghiệm theo số lượng câu hỏi được chọn.
 */
function buildMultipleChoiceQuestionRequirements(numQuestions: number): string {
  if (numQuestions <= 3) {
    return `- 1 câu hỏi Ý chính (Main Idea / Purpose)\n- ${numQuestions - 1} câu hỏi Chi tiết trong bài (Factual Details)`
  }

  if (numQuestions <= 5) {
    const detailCount = numQuestions - 2
    return `- 1 câu hỏi Ý chính (Main Idea / Purpose)
- ${detailCount} câu hỏi Chi tiết cụ thể trong bài (Factual Details)
- 1 câu hỏi Từ vựng ngữ cảnh (Vocabulary in Context) bám sát từ vựng mục tiêu ở trên`
  }

  // numQuestions >= 6: Phân bổ toàn diện chuẩn TOEIC / VSTEP / IELTS
  const detailCount = Math.max(2, Math.floor(numQuestions * 0.45))
  const vocabCount = Math.min(2, Math.max(1, Math.floor(numQuestions * 0.2)))
  const remaining = Math.max(1, numQuestions - 2 - detailCount - vocabCount)

  return `- 1 câu hỏi Ý chính bài đọc (Main Idea / Gist / Author's Purpose)
- ${detailCount} câu hỏi Chi tiết cụ thể trong bài (Factual Details)
- 1 câu hỏi Thông tin KHÔNG có trong bài hoặc Sai (Negative Detail: EXCEPT / NOT mentioned)
- ${vocabCount} câu hỏi Từ vựng trong ngữ cảnh (Vocabulary in Context) dựa trên từ vựng ở trên
- ${remaining} câu hỏi Suy luận logic hoặc Đại từ quy chiếu (Inference / Reference)`
}

const SAMPLE_QUESTIONS_BY_TYPE: Record<ReadingInteractionType, Record<string, unknown>> = {
  multiple_choice: {
    kind: 'multiple_choice',
    text: 'Nội dung câu hỏi trắc nghiệm...',
    options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
    correctIndex: 0,
    explanation: 'Dẫn chứng và giải thích ngắn gọn bằng tiếng Việt',
  },
  true_false: {
    kind: 'true_false',
    text: 'Câu nhận định...',
    options: ['True', 'False', 'Not Given'],
    correctIndex: 0,
    explanation: 'Giải thích dẫn chứng vì sao True/False/Not Given',
  },
  cloze: {
    kind: 'cloze_choice',
    text: 'Chọn từ thích hợp cho vị trí (1):',
    options: ['Đáp án đúng', 'Nhiễu 1', 'Nhiễu 2', 'Nhiễu 3'],
    correctIndex: 0,
    explanation: 'Giải thích ngữ nghĩa và ngữ pháp bằng tiếng Việt',
  },
  matching_heading: {
    kind: 'matching_heading',
    text: 'Chọn tiêu đề phù hợp nhất cho Paragraph A:',
    options: ['Heading 1', 'Heading 2', 'Heading 3', 'Heading gây nhiễu'],
    correctIndex: 0,
    explanation: 'Giải thích dẫn chứng khớp với tiêu đề này',
  },
  sentence_insertion: {
    kind: 'sentence_insertion',
    text: 'Xem xét câu văn sau:',
    sentence: 'Câu văn cần chèn...',
    options: ['[A]', '[B]', '[C]', '[D]'],
    correctIndex: 1,
    explanation: 'Giải thích logic ngữ cảnh của vị trí này',
  },
  short_answer: {
    kind: 'short_answer',
    text: 'Nội dung câu hỏi ngắn hoặc chỗ trống ______ (NO MORE THAN TWO WORDS):',
    answer: 'đáp án chuẩn|đáp án phụ nếu có',
    explanation: 'Dẫn chứng từ bài đọc',
  },
}

function getSampleQuestionForType(
  type: ReadingInteractionType,
  id = 'q1',
): Record<string, unknown> {
  const base = SAMPLE_QUESTIONS_BY_TYPE[type] || SAMPLE_QUESTIONS_BY_TYPE.multiple_choice
  return { id, ...base }
}

/**
 * Phân chia số lượng câu hỏi và mô tả chi tiết cho từng dạng khi Mix.
 */
function buildMixedQuestionRequirements(
  types: ReadingInteractionType[],
  numQuestions: number,
): string {
  const baseCount = Math.max(1, Math.floor(numQuestions / types.length))
  const remainder = numQuestions % types.length

  const typeDescMap: Record<ReadingInteractionType, string> = {
    multiple_choice:
      'câu hỏi Trắc nghiệm 4 đáp án (A, B, C, D) bao gồm ý chính, chi tiết hoặc từ vựng ngữ cảnh',
    true_false:
      'câu nhận định dạng True / False / Not Given (options: ["True", "False", "Not Given"])',
    cloze: 'câu đục lỗ khuyết từ với 4 phương án trắc nghiệm (tập trung vào từ vựng mục tiêu)',
    matching_heading:
      'câu ghép tiêu đề (Heading) phù hợp cho các đoạn văn Paragraph A, Paragraph B... kèm tiêu đề nhiễu',
    sentence_insertion: 'câu chèn câu văn (sentence) vào vị trí thích hợp [A], [B], [C], [D]',
    short_answer:
      'câu trả lời ngắn / điền từ tóm tắt (NO MORE THAN TWO/THREE WORDS, quy định rõ trường "answer")',
  }

  const items = types.map((t, idx) => {
    const count = baseCount + (idx < remainder ? 1 : 0)
    return `- ${count} ${typeDescMap[t]}`
  })

  return items.join('\n')
}

/**
 * Sinh cấu trúc JSON đầu ra chuẩn hóa cho Prompt AI.
 * Đảm bảo 100% đồng bộ với bộ parser validateReadingJson và ReadingEditor.
 */
function formatOutputSchema(
  isMultiPassage: boolean,
  defaultTitle: string,
  sampleText: string,
  sampleQuestions: Record<string, unknown> | Array<Record<string, unknown>>,
): string {
  const qList = Array.isArray(sampleQuestions) ? sampleQuestions : [sampleQuestions]
  if (isMultiPassage) {
    const multiObj = {
      passages: [
        {
          title: 'Bài đọc 1: Tiêu đề bài đọc 1',
          text: sampleText,
          questions: qList,
        },
      ],
    }
    return `ĐỊNH DẠNG ĐẦU RA:
Chỉ trả về DUY NHẤT một chuỗi JSON trong block JSON code hợp lệ để dễ dàng review theo cấu trúc sau (không thêm văn bản chào hỏi hay giải thích ngoài JSON):
${JSON.stringify(multiObj, null, 2)}`
  }

  const singleObj = {
    title: defaultTitle,
    text: sampleText,
    questions: qList,
  }
  return `ĐỊNH DẠNG ĐẦU RA:
Chỉ trả về DUY NHẤT một chuỗi JSON trong block JSON code hợp lệ để dễ dàng review theo cấu trúc sau (không thêm văn bản chào hỏi hay giải thích ngoài JSON):
${JSON.stringify(singleObj, null, 2)}`
}

export function generateReadingPrompt({
  type,
  types,
  vocabItems,
  unitTitle,
  topic,
  wordCount = 200,
  numQuestions = 4,
  numPassages = 1,
  targetLevel,
}: GeneratePromptParams): string {
  const targetLevelSection = formatTargetLevelRequirement(targetLevel)
  const vocabSection = formatVocabListForPrompt(vocabItems)
  const unitContext = unitTitle ? `bám sát chương trình của ${unitTitle}` : ''
  const topicContext = topic ? `về chủ đề "${topic}"` : ''

  const isMultiPassage = numPassages > 1

  // Xác định danh sách các dạng cần sinh (hỗ trợ cả dạng đơn lẫn Mix nhiều dạng)
  const activeTypes: ReadingInteractionType[] =
    types && types.length > 0 ? types : type ? [type] : ['multiple_choice']

  const passageIntro = isMultiPassage
    ? `Hãy tạo đúng ${numPassages} bài đọc tiếng Anh độc lập (Passage 1, Passage 2... ${numPassages > 2 ? `Passage ${numPassages}` : ''}), mỗi bài đọc có độ dài khoảng ${wordCount} từ ${unitContext} ${topicContext}.`
    : `Hãy viết 1 bài đọc hiểu tiếng Anh có độ dài khoảng ${wordCount} từ ${unitContext} ${topicContext}.`

  const perPassageRequirement = isMultiPassage
    ? `Với MỖI bài đọc, hãy tạo đúng ${numQuestions} câu hỏi:`
    : `Tạo đúng ${numQuestions} câu hỏi:`

  // === TRƯỜNG HỢP 1: MIX NHIỀU DẠNG CÂU HỎI TRONG CÙNG 1 BÀI ĐỌC ===
  if (activeTypes.length > 1) {
    const mixedRequirements = buildMixedQuestionRequirements(activeTypes, numQuestions)

    let passageSpecificNotes = ''
    if (activeTypes.includes('matching_heading')) {
      passageSpecificNotes +=
        '\n- CẤU TRÚC ĐOẠN VĂN: BẮT BUỘC chia bài đọc thành các đoạn văn ngắn có tiêu đề rõ ràng: Paragraph A, Paragraph B, Paragraph C... để phục vụ câu hỏi nối tiêu đề.'
    }
    if (activeTypes.includes('cloze')) {
      passageSpecificNotes +=
        '\n- VỊ TRÍ ĐỤC LỖ: Trong bài đọc, tại đúng các vị trí trọng tâm, hãy đục lỗ đánh dấu rõ ràng dạng: (1)______, (2)______... (rơi trúng vào từ vựng mục tiêu).'
    }
    if (activeTypes.includes('sentence_insertion')) {
      passageSpecificNotes +=
        '\n- KÝ HIỆU CHÈN CÂU: Trong bài đọc, hãy chèn chính xác 4 vị trí ký hiệu [A], [B], [C], [D] tại các điểm chuyển ý tự nhiên để phục vụ câu hỏi chèn câu.'
    }

    const sampleQuestions = activeTypes.map((t, idx) =>
      getSampleQuestionForType(t, isMultiPassage ? `p1_q${idx + 1}` : `q${idx + 1}`),
    )

    let mixedSampleText = `Nội dung bài đọc tiếng Anh khoảng ${wordCount} từ...`
    if (activeTypes.includes('matching_heading')) {
      mixedSampleText = `Paragraph A: Đoạn văn A khoảng ${Math.round(wordCount / 2)} từ...\\n\\nParagraph B: Đoạn văn B khoảng ${Math.round(wordCount / 2)} từ...`
    }
    if (activeTypes.includes('cloze')) {
      mixedSampleText += ' Bài đọc chứa các vị trí khuyết từ (1)______, (2)______...'
    }
    if (activeTypes.includes('sentence_insertion')) {
      mixedSampleText += ' [A] Đoạn văn có các [B] vị trí đánh dấu [C] chèn câu [D]...'
    }

    const outputSchema = formatOutputSchema(
      isMultiPassage,
      `Part 3: Reading Comprehension (Mix ${activeTypes.length} dạng câu hỏi)`,
      mixedSampleText,
      sampleQuestions,
    )

    return `Bạn là chuyên gia khảo thí tiếng Anh quốc tế (chuẩn Cambridge / IELTS / TOEFL / THPT Quốc Gia).
${passageIntro}${passageSpecificNotes}

${targetLevelSection}

${vocabSection}

YÊU CẦU BỘ CÂU HỎI (MIX ${activeTypes.length} DẠNG CÂU HỎI):
${perPassageRequirement}
${mixedRequirements}

${outputSchema}`
  }

  // === TRƯỜNG HỢP 2: MỘT DẠNG DUY NHẤT ===
  const singleType = activeTypes[0]

  switch (singleType) {
    case 'multiple_choice':
    default: {
      const questionBreakdown = buildMultipleChoiceQuestionRequirements(numQuestions)
      const outputSchema = formatOutputSchema(
        isMultiPassage,
        'Part 3: Reading Comprehension',
        `Nội dung đoạn văn tiếng Anh khoảng ${wordCount} từ...`,
        getSampleQuestionForType('multiple_choice', isMultiPassage ? 'p1_q1' : 'q1'),
      )

      return `Bạn là chuyên gia khảo thí tiếng Anh quốc tế.
${passageIntro}

${targetLevelSection}

${vocabSection}

YÊU CẦU BỘ CÂU HỎI:
${perPassageRequirement}
${questionBreakdown}

${outputSchema}`
    }

    case 'true_false': {
      const tfBreakdown = `- Ít nhất 1 câu Not Given (thông tin không được đề cập hoặc không đủ căn cứ suy đoán)
- Ít nhất ${Math.max(1, Math.floor(numQuestions / 3))} câu False (mâu thuẫn rõ ràng với bài đọc)
- Các câu còn lại là True (khớp hoàn toàn với bài đọc)`

      const outputSchema = formatOutputSchema(
        isMultiPassage,
        'Part 3: True / False / Not Given',
        `Nội dung đoạn văn khoảng ${wordCount} từ...`,
        getSampleQuestionForType('true_false', isMultiPassage ? 'p1_q1' : 'q1'),
      )

      return `Bạn là chuyên gia soạn đề Cambridge / IELTS Reading.
${passageIntro}

${targetLevelSection}

${vocabSection}

YÊU CẦU CÂU HỎI:
${perPassageRequirement}
Tạo ${numQuestions} câu nhận định dạng True / False / Not Given (options: ["True", "False", "Not Given"]):
${tfBreakdown}

${outputSchema}`
    }

    case 'cloze': {
      const blankMarkers = Array.from({ length: numQuestions }, (_, i) => `(${i + 1})______`).join(
        ', ',
      )
      const outputSchema = formatOutputSchema(
        isMultiPassage,
        'Part 3: Cloze Test',
        `Nội dung đoạn văn khoảng ${wordCount} từ chứa các ký hiệu ${blankMarkers}...`,
        getSampleQuestionForType('cloze', isMultiPassage ? 'p1_q1' : 'q1'),
      )

      return `Bạn là chuyên gia khảo thí tiếng Anh (chuẩn THPT QG / TOEIC Part 6).
${passageIntro}
Trong bài đọc, tại đúng ${numQuestions} vị trí trọng tâm, hãy đục lỗ đánh dấu rõ ràng dạng: ${blankMarkers}.

${targetLevelSection}

${vocabSection}
ĐẶC BIỆT: Các vị trí đục lỗ BẮT BUỘC rơi trúng vào các từ vựng mục tiêu ở trên.
Với mỗi chỗ trống, hãy cung cấp 4 phương án trắc nghiệm A, B, C, D (với 3 phương án gây nhiễu cùng từ loại hợp lý).

${outputSchema}`
    }

    case 'matching_heading': {
      const outputSchema = formatOutputSchema(
        isMultiPassage,
        'Part 3: Matching Headings',
        'Paragraph A: ...\\n\\nParagraph B: ...',
        getSampleQuestionForType('matching_heading', isMultiPassage ? 'p1_q1' : 'q1'),
      )

      return `Bạn là chuyên gia luyện thi IELTS Reading.
${passageIntro}
Hãy chia bài đọc thành các đoạn văn ngắn: Paragraph A, Paragraph B... tương ứng.

${targetLevelSection}

${vocabSection}

Tạo một danh sách tiêu đề (List of Headings) gồm các tiêu đề tương ứng và 1-2 tiêu đề gây nhiễu.
Tạo đúng ${numQuestions} câu hỏi ghép tiêu đề cho các đoạn văn.

${outputSchema}`
    }

    case 'sentence_insertion': {
      const outputSchema = formatOutputSchema(
        isMultiPassage,
        'Part 3: Sentence Insertion',
        `Đoạn văn khoảng ${wordCount} từ có chứa [A] các ký hiệu [B] đánh dấu [C] chèn câu [D]...`,
        getSampleQuestionForType('sentence_insertion', isMultiPassage ? 'p1_q1' : 'q1'),
      )

      return `Bạn là chuyên gia khảo thí TOEFL iBT.
${passageIntro}
Trong bài đọc, hãy chèn chính xác 4 vị trí ký hiệu [A], [B], [C], [D] tại các điểm chuyển ý tự nhiên.

${targetLevelSection}

${vocabSection}

Cung cấp câu văn độc lập (Target Sentence) để chèn vào.
Tạo đúng ${numQuestions} câu hỏi xác định vị trí chèn phù hợp.

${outputSchema}`
    }

    case 'short_answer': {
      const outputSchema = formatOutputSchema(
        isMultiPassage,
        'Part 3: Short Answer & Summary Completion',
        `Nội dung bài đọc khoảng ${wordCount} từ...`,
        getSampleQuestionForType('short_answer', isMultiPassage ? 'p1_q1' : 'q1'),
      )

      return `Bạn là chuyên gia khảo thí tiếng Anh.
${passageIntro}

${targetLevelSection}

${vocabSection}

Tạo đúng ${numQuestions} câu hỏi yêu cầu học sinh đọc và trả lời ngắn (hoặc điền từ vào đoạn tóm tắt khuyết từ, quy định rõ NO MORE THAN TWO/THREE WORDS).

${outputSchema}`
    }
  }
}
