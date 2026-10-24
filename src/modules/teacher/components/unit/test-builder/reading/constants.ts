import type { ReadingInteractionType } from './types'

export interface ReadingTypeOption {
  type: ReadingInteractionType
  title: string
  badge: string
  desc: string
}

export const READING_TYPES: ReadingTypeOption[] = [
  {
    type: 'multiple_choice',
    title: 'Trắc nghiệm chọn đáp án (A, B, C, D)',
    badge: 'Phổ biến nhất',
    desc: 'Bao gồm 6 mục tiêu: Ý chính, Chi tiết, Negative Detail, Từ vựng ngữ cảnh, Đại từ, Suy luận.',
  },
  {
    type: 'true_false',
    title: 'Đúng / Sai / Không đề cập (T/F/NG)',
    badge: 'Chuẩn IELTS / Cambridge',
    desc: 'Đưa ra các nhận định, học sinh xác định True, False hoặc Not Given.',
  },
  {
    type: 'cloze',
    title: 'Đục lỗ điền từ (Cloze Test)',
    badge: 'THPT QG & TOEIC Part 6',
    desc: 'Đoạn văn khuyết các vị trí (1), (2)... với 4 phương án trắc nghiệm hoặc tự điền từ.',
  },
  {
    type: 'matching_heading',
    title: 'Ghép tiêu đề đoạn văn (Matching Headings)',
    badge: 'Đặc trưng IELTS',
    desc: 'Đoạn văn chia Paragraph A, B, C... học sinh chọn Heading phù hợp cho từng đoạn.',
  },
  {
    type: 'sentence_insertion',
    title: 'Chèn câu vào vị trí thích hợp ([A], [B], [C], [D])',
    badge: 'Chuẩn TOEFL iBT',
    desc: 'Cho một câu mới, chọn vị trí [A], [B], [C] hoặc [D] trong bài đọc để chèn vào.',
  },
  {
    type: 'short_answer',
    title: 'Điền từ tóm tắt / Trả lời ngắn (Short Answer)',
    badge: 'Tự luận / Tóm tắt',
    desc: 'Đoạn tóm tắt khuyết từ (No more than 2 words) hoặc câu hỏi ngắn tự gõ câu trả lời.',
  },
]

export const READING_SAMPLE_JSONS: Record<ReadingInteractionType, string> = {
  multiple_choice: JSON.stringify(
    {
      title: 'Part 3: Reading Comprehension',
      text: 'In many parts of the world, sustainable energy is rapidly expanding. Governments and private corporations are investing billions of dollars into renewable energy sources like wind, solar, and hydro power. The primary goal is to significantly reduce carbon emissions and combat severe climate change. Although the initial transition cost is substantial, the long-term environmental and economic benefits are undeniable.',
      questions: [
        {
          id: 'q1',
          kind: 'multiple_choice',
          text: 'What is the main topic of the passage?',
          options: [
            'The high cost of fossil fuels',
            'The rise and benefits of sustainable energy',
            'Traditional methods of energy production',
            'Government policies on vehicle manufacturing',
          ],
          correctIndex: 1,
          explanation: 'Đoạn văn tập trung giới thiệu về sự phát triển và lợi ích của năng lượng bền vững.',
        },
        {
          id: 'q2',
          kind: 'multiple_choice',
          text: 'The word "sustainable" in paragraph 1 is closest in meaning to:',
          options: [
            'temporary and unstable',
            'renewable and environmentally friendly',
            'expensive and scarce',
            'difficult to maintain',
          ],
          correctIndex: 1,
          explanation: '"Sustainable" đồng nghĩa với "renewable and environmentally friendly" (bền vững, thân thiện môi trường).',
        },
        {
          id: 'q3',
          kind: 'multiple_choice',
          text: 'According to the passage, which of the following is NOT true?',
          options: [
            'Governments are investing in clean energy.',
            'The transition to renewable energy is completely free of cost.',
            'Wind and solar are renewable energy sources.',
            'Renewable energy helps combat climate change.',
          ],
          correctIndex: 1,
          explanation: 'Bài viết nêu "initial transition cost is substantial" (chi phí ban đầu rất lớn), do đó câu nói "hoàn toàn miễn phí" là sai.',
        },
        {
          id: 'q4',
          kind: 'multiple_choice',
          text: 'What can be inferred about the future of renewable energy?',
          options: [
            'It will be abandoned soon due to high expenses.',
            'It will bring undeniable long-term benefits despite initial costs.',
            'It is only suitable for wealthy countries.',
            'It causes more pollution than fossil fuels.',
          ],
          correctIndex: 1,
          explanation: 'Câu kết nhấn mạnh lợi ích lâu dài về môi trường và kinh tế là không thể phủ nhận.',
        },
      ],
    },
    null,
    2,
  ),

  true_false: JSON.stringify(
    {
      title: 'Part 3: True / False / Not Given',
      text: 'Electric vehicles (EVs) have gained significant popularity over the past decade. Many cities around the world have introduced special bus lanes and free parking spaces for electric cars to encourage residents to adopt greener transport. However, the battery recycling infrastructure is still facing technical challenges that need international collaboration to solve.',
      questions: [
        {
          id: 'q1',
          kind: 'true_false',
          text: 'Electric vehicles have become more popular in the last ten years.',
          options: ['True', 'False', 'Not Given'],
          correctIndex: 0,
          explanation: 'Thông tin trực tiếp ở câu đầu: "gained significant popularity over the past decade".',
        },
        {
          id: 'q2',
          kind: 'true_false',
          text: 'Electric vehicles are completely forbidden in public bus lanes.',
          options: ['True', 'False', 'Not Given'],
          correctIndex: 1,
          explanation: 'Bài đọc nêu nhiều thành phố đã mở làn xe buýt đặc biệt cho xe điện.',
        },
        {
          id: 'q3',
          kind: 'true_false',
          text: 'The cost of manufacturing EV batteries will drop by 50% next year.',
          options: ['True', 'False', 'Not Given'],
          correctIndex: 2,
          explanation: 'Bài viết không đề cập đến chi phí sản xuất pin trong năm tới.',
        },
      ],
    },
    null,
    2,
  ),

  cloze: JSON.stringify(
    {
      title: 'Part 3: Guided Cloze Test',
      text: 'Environmental protection requires urgent action from all individuals. When toxic chemicals are (1)______ into rivers, they destroy aquatic ecosystems. People must adopt more (2)______ habits, such as reducing single-use plastic and conserving clean water. Schools should also (3)______ students about preserving local natural reserves.',
      questions: [
        {
          id: 'q1',
          kind: 'cloze_choice',
          text: 'Chọn từ thích hợp cho vị trí (1):',
          options: ['discharged', 'purified', 'collected', 'absorbed'],
          correctIndex: 0,
          explanation: '"discharged into rivers" = thải ra sông ngòi.',
        },
        {
          id: 'q2',
          kind: 'cloze_choice',
          text: 'Chọn từ thích hợp cho vị trí (2):',
          options: ['harmful', 'sustainable', 'careless', 'destructive'],
          correctIndex: 1,
          explanation: '"sustainable habits" = thói quen bền vững.',
        },
        {
          id: 'q3',
          kind: 'cloze_choice',
          text: 'Chọn từ thích hợp cho vị trí (3):',
          options: ['educate', 'discourage', 'ignore', 'punish'],
          correctIndex: 0,
          explanation: '"educate students about..." = giáo dục học sinh về...',
        },
      ],
    },
    null,
    2,
  ),

  matching_heading: JSON.stringify(
    {
      title: 'Part 3: Matching Headings',
      text: 'Paragraph A: The history of coffee begins in the ancient forests of Ethiopia, where local legends tell of a goat herder who discovered the energizing effects of coffee cherries.\n\nParagraph B: During the 16th century, coffee spread across the Middle East. Public coffee houses emerged as lively social hubs where thinkers and merchants exchanged ideas.\n\nParagraph C: Today, global coffee cultivation faces threats from rising temperatures and unpredictable weather patterns, prompting researchers to develop climate-resilient bean varieties.',
      questions: [
        {
          id: 'q1',
          kind: 'matching_heading',
          text: 'Chọn tiêu đề phù hợp nhất cho Paragraph A:',
          options: [
            'Early origins and folklore in Africa',
            'Coffee houses as intellectual centers',
            'Modern environmental challenges',
            'Global trade agreements',
          ],
          correctIndex: 0,
          explanation: 'Đoạn A nói về nguồn gốc sơ khai và huyền thoại ở Ethiopia.',
        },
        {
          id: 'q2',
          kind: 'matching_heading',
          text: 'Chọn tiêu đề phù hợp nhất cho Paragraph B:',
          options: [
            'Early origins and folklore in Africa',
            'Coffee houses as intellectual centers',
            'Modern environmental challenges',
            'Global trade agreements',
          ],
          correctIndex: 1,
          explanation: 'Đoạn B nói về quán cà phê như trung tâm văn hóa trí thức ở Trung Đông.',
        },
        {
          id: 'q3',
          kind: 'matching_heading',
          text: 'Chọn tiêu đề phù hợp nhất cho Paragraph C:',
          options: [
            'Early origins and folklore in Africa',
            'Coffee houses as intellectual centers',
            'Modern environmental challenges',
            'Global trade agreements',
          ],
          correctIndex: 2,
          explanation: 'Đoạn C nói về nguy cơ khí hậu đe dọa các giống cà phê hiện đại.',
        },
      ],
    },
    null,
    2,
  ),

  sentence_insertion: JSON.stringify(
    {
      title: 'Part 3: Sentence Insertion',
      text: 'Artificial intelligence is reshaping healthcare diagnostics worldwide. [A] Machine learning algorithms can analyze thousands of medical imaging scans in seconds. [B] Doctors are utilizing these insights to detect early-stage cancers with unprecedented accuracy. [C] However, ethical questions regarding patient privacy and algorithm accountability remain heated topics of debate among healthcare specialists. [D]',
      questions: [
        {
          id: 'q1',
          kind: 'sentence_insertion',
          text: 'Xem xét câu văn sau: "This remarkable speed enables medical staff to prioritize critical emergencies swiftly."',
          sentence: 'This remarkable speed enables medical staff to prioritize critical emergencies swiftly.',
          options: ['[A]', '[B]', '[C]', '[D]'],
          correctIndex: 1,
          explanation: 'Câu này giải thích cho cụm "in seconds" ở câu phía trước [B].',
        },
      ],
    },
    null,
    2,
  ),

  short_answer: JSON.stringify(
    {
      title: 'Part 3: Summary Completion & Short Answer',
      text: 'The Mariana Trench is the deepest oceanic trench on Earth, located in the western Pacific Ocean. It reaches a maximum depth of approximately 11,000 meters at the Challenger Deep. Despite the extreme hydrostatic pressure and total lack of sunlight, various specialized organisms thrive in this hostile environment, including amphipods and unique microbial communities.',
      questions: [
        {
          id: 'q1',
          kind: 'short_answer',
          text: 'Điền từ thích hợp vào chỗ trống (KHÔNG QUÁ 2 TỪ): The deepest point of the Mariana Trench is called the ______.',
          answer: 'Challenger Deep',
          explanation: 'Trong bài viết nêu rõ: "at the Challenger Deep".',
        },
        {
          id: 'q2',
          kind: 'short_answer',
          text: 'What is the maximum depth of the Mariana Trench? (e.g., 11,000 meters)',
          answer: '11,000 meters|11000 meters|11,000m',
          explanation: 'Có thể điền "11,000 meters" hoặc "11000 meters".',
        },
      ],
    },
    null,
    2,
  ),
}

export interface TargetLevelPreset {
  id: string
  label: string
  badge: string
  description: string
  suggestedWords: number
}

export const TARGET_LEVEL_PRESETS: TargetLevelPreset[] = [
  {
    id: 'primary',
    label: 'Tiểu học (Lớp 1-5 / A1)',
    badge: 'Tiểu học (A1)',
    description: 'Từ vựng đơn giản, câu ngắn S-V-O, chủ đề trường học, bạn bè, vật nuôi.',
    suggestedWords: 150,
  },
  {
    id: 'secondary',
    label: 'THCS (Lớp 6-9 / A2-B1)',
    badge: 'THCS (A2-B1)',
    description: 'Thì quá khứ, hiện tại hoàn thành, câu điều kiện loại 1, đời sống thiếu niên.',
    suggestedWords: 200,
  },
  {
    id: 'high_school',
    label: 'THPT & Thi Tốt nghiệp (B1-B2)',
    badge: 'THPT QG (B1-B2)',
    description: 'Câu phức, mệnh đề quan hệ, từ vựng học thuật phổ thông, bẫy trắc nghiệm.',
    suggestedWords: 300,
  },
  {
    id: 'toeic_550',
    label: 'TOEIC 450 - 650',
    badge: 'TOEIC 550',
    description: 'Email, thông báo nội bộ công sở, lịch trình, dịch vụ khách hàng.',
    suggestedWords: 250,
  },
  {
    id: 'toeic_750',
    label: 'TOEIC 700 - 850+',
    badge: 'TOEIC 750+',
    description: 'Hợp đồng, báo cáo tài chính, đàm phán hợp tác kinh doanh.',
    suggestedWords: 400,
  },
  {
    id: 'ielts_55',
    label: 'IELTS 5.0 - 6.0',
    badge: 'IELTS 5.5',
    description: 'Bài đọc khoa học thường thức, văn hóa, môi trường mức B2.',
    suggestedWords: 350,
  },
  {
    id: 'ielts_65',
    label: 'IELTS 6.5 - 7.5',
    badge: 'IELTS 7.0',
    description: 'Văn phong học thuật đại học C1, paraphrase cao, suy luận logic sâu.',
    suggestedWords: 500,
  },
  {
    id: 'ielts_80',
    label: 'IELTS 8.0 - 9.0',
    badge: 'IELTS 8.0+',
    description: 'Nghiên cứu học thuật C1-C2, bẫy tinh tế, lập luận trừu tượng chuyên sâu.',
    suggestedWords: 750,
  },
]

/**
 * Trả về chuỗi JSON mẫu cho 1 dạng hoặc kết hợp (Mix) nhiều dạng câu hỏi được chọn.
 */
export function getSampleJsonForTypes(types: ReadingInteractionType[]): string {
  if (types.length === 0) {
    return READING_SAMPLE_JSONS.multiple_choice
  }
  if (types.length === 1) {
    return READING_SAMPLE_JSONS[types[0]] || READING_SAMPLE_JSONS.multiple_choice
  }

  // Tạo JSON mẫu kết hợp các dạng câu hỏi được chọn
  const questions: unknown[] = []
  types.forEach((t, idx) => {
    try {
      const parsed = JSON.parse(READING_SAMPLE_JSONS[t]) as { questions?: unknown[] }
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const firstQ = (typeof parsed.questions[0] === 'object' && parsed.questions[0] !== null
          ? { ...parsed.questions[0], id: `q${idx + 1}` }
          : parsed.questions[0])
        questions.push(firstQ)
      }
    } catch {
      // Fallback
    }
  })

  let combinedText =
    'In many parts of the world, sustainable energy is rapidly expanding. Governments and private corporations are investing billions of dollars into renewable energy sources like wind, solar, and hydro power. The primary goal is to significantly reduce carbon emissions and combat severe climate change. Although the initial transition cost is substantial, the long-term environmental and economic benefits are undeniable.'

  if (types.includes('matching_heading')) {
    combinedText =
      'Paragraph A: In many parts of the world, sustainable energy is rapidly expanding. Governments and private corporations are investing billions of dollars into renewable energy sources.\n\nParagraph B: The primary goal is to significantly reduce carbon emissions and combat severe climate change. Although the initial transition cost is substantial, the long-term benefits are undeniable.'
  }

  if (types.includes('cloze')) {
    combinedText += ' Consequently, clean technology has become a (1)______ priority for global leaders.'
  }

  if (types.includes('sentence_insertion')) {
    combinedText +=
      ' [A] Energy experts predict continued acceleration. [B] Storage battery technology is also advancing rapidly. [C] New policies will further incentivize adoption. [D]'
  }

  return JSON.stringify(
    {
      title: `Part 3: Reading Comprehension (Mix ${types.length} dạng câu hỏi)`,
      text: combinedText,
      questions,
    },
    null,
    2
  )
}
