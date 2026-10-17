import {
  CheckSquare,
  Type,
  AlignLeft,
  GripVertical,
  ListOrdered,
  Headphones,
} from 'lucide-react'
import type { TemplateItem } from './types'

export const TEMPLATES: TemplateItem[] = [
  {
    type: 'multiple_choice',
    title: 'Trắc nghiệm (Multiple Choice)',
    icon: CheckSquare,
    desc: 'Chọn 1 đáp án đúng A, B, C, D',
  },
  {
    type: 'fill_blank',
    title: 'Điền khuyết (Fill in the Blanks)',
    icon: Type,
    desc: 'Tự gõ đáp án (Không phân biệt hoa thường)',
  },
  {
    type: 'reading',
    title: 'Đọc hiểu (Reading Comprehension)',
    icon: AlignLeft,
    desc: 'Đoạn văn kèm câu hỏi T/F hoặc chọn đáp án',
  },
  {
    type: 'matching',
    title: 'Ghép nối (Matching)',
    icon: GripVertical,
    desc: 'Nối cột A với cột B',
  },
  {
    type: 'reorder',
    title: 'Sắp xếp câu (Sentence Reordering)',
    icon: ListOrdered,
    desc: 'Sắp xếp các từ bị xáo trộn thành câu hoàn chỉnh',
  },
  {
    type: 'listening',
    title: 'Nghe hiểu (Listening)',
    icon: Headphones,
    desc: 'File Audio nghe và trả lời câu hỏi',
  },
]
