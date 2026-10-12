import { BookA, Gamepad2, Zap } from 'lucide-react'
import { StudentAnalyticsData } from '../../types'

type UnitProgressStudentRowProps = {
  data: StudentAnalyticsData
}

const UnitProgressStudentRow = ({ data }: UnitProgressStudentRowProps) => {
  return (
    <tr
      className="border-b border-gray-50 last:border-0 hover:bg-blue-50/20 transition-colors"
    >
      {/* Student Info */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            {data.student.name.charAt(0)}
          </div>
          <span className="font-bold text-gray-800">{data.student.name}</span>
        </div>
      </td>

      {/* Mastery Progress */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1 pr-8">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-gray-700">Đã thuộc</span>
            <span className="font-bold text-emerald-600">
              {data.masteryProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${data.masteryProgress}%` }}
            ></div>
          </div>
        </div>
      </td>

      {/* Game Activities */}
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-2">
          {data.games.flashcard.played && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs font-semibold">
              <BookA size={12} />
              <span>{data.games.flashcard.timesPlayed} lượt</span>
            </div>
          )}
          {data.games.quiz.played && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 text-xs font-semibold">
              <Gamepad2 size={12} />
              <span>({data.games.quiz.timesPlayed}L)</span>
            </div>
          )}
          {data.games.match.played && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-100 text-xs font-semibold">
              <Zap size={12} />
              <span>{data.games.match.bestTime}s</span>
            </div>
          )}
          {!data.games.flashcard.played &&
            !data.games.quiz.played &&
            !data.games.match.played && (
              <span className="text-xs text-gray-400 italic">
                Chưa tham gia hoạt động nào
              </span>
            )}
        </div>
      </td>

      {/* Unit Exams */}
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-1.5">
          {data.exams && data.exams.length > 0 ? (
            data.exams.map((exam) => (
              <div
                key={exam.id}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  exam.isCompleted
                    ? (exam.score ?? 0) >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : (exam.score ?? 0) >= 50
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
                title={exam.title}
              >
                <span className="truncate max-w-[100px]">{exam.title}:</span>
                <span>{exam.isCompleted ? `${exam.score}đ` : 'Chưa làm'}</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">Chưa có bài thi</span>
          )}
        </div>
      </td>
    </tr>
  )
}

export default UnitProgressStudentRow
