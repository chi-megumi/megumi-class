import { useState, useEffect, useRef } from 'react'
import { useFlashcardStore } from '../../stores/useFlashcardStore'
import { playSound } from '../../utils/sound'
import { formatDuration } from '../../utils/score'
import { PlayCircle, Clock } from 'lucide-react'
import { useConfetti } from '../../hooks/useConfetti'

type Card = {
  id: string // unique id for the card on the board
  wordId: string // id of the vocabulary item
  type: 'word' | 'meaning'
  text: string
  isMatched: boolean
}

export function MatchGame() {
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCards, setSelectedCards] = useState<Card[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [mismatchWait, setMismatchWait] = useState(false)
  
  const { fireConfetti } = useConfetti()

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startGame = () => {
    if (vocabItems.length === 0) return

    // Pick up to 6 random words
    const shuffledVocab = [...vocabItems].sort(() => Math.random() - 0.5)
    const selectedVocab = shuffledVocab.slice(0, Math.min(6, vocabItems.length))

    // Create cards
    const newCards: Card[] = []
    selectedVocab.forEach((item) => {
      newCards.push({
        id: `word-${item.id}`,
        wordId: item.id,
        type: 'word',
        text: item.word,
        isMatched: false,
      })
      newCards.push({
        id: `meaning-${item.id}`,
        wordId: item.id,
        type: 'meaning',
        text: item.vi,
        isMatched: false,
      })
    })

    setCards(newCards.sort(() => Math.random() - 0.5))
    setSelectedCards([])
    setIsPlaying(true)
    setIsFinished(false)
    setStartTime(Date.now())
    setElapsed(0)
    setMismatchWait(false)
  }

  // Timer loop
  useEffect(() => {
    if (isPlaying && !isFinished) {
      timerRef.current = setInterval(() => {
        if (startTime) {
          setElapsed(Date.now() - startTime)
        }
      }, 100)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, isFinished, startTime])

  const handleCardClick = (card: Card) => {
    if (!isPlaying || isFinished || mismatchWait || card.isMatched) return
    // If clicking the same card
    if (selectedCards.some((c) => c.id === card.id)) return

    const newSelection = [...selectedCards, card]
    setSelectedCards(newSelection)

    if (newSelection.length === 2) {
      // Check match
      const [first, second] = newSelection
      if (first.wordId === second.wordId) {
        // Match!
        playSound('correct')
        setCards((prev) => {
          const next = prev.map((c) => (c.wordId === first.wordId ? { ...c, isMatched: true } : c))
          if (next.length > 0 && next.every((c) => c.isMatched)) {
            setTimeout(() => {
              setIsFinished(true)
              playSound('correct')
              fireConfetti()
            }, 300)
          }
          return next
        })
        setSelectedCards([])
      } else {
        // Mismatch
        playSound('incorrect')
        setMismatchWait(true)
        setTimeout(() => {
          setSelectedCards([])
          setMismatchWait(false)
        }, 800) // 800ms wait
      }
    }
  }

  // Check win condition removed from effect

  if (vocabItems.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>Cần ít nhất 2 từ vựng để chơi game ghép thẻ.</p>
      </div>
    )
  }

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🧩</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Ghép Thẻ</h2>
          <p className="text-gray-500 mb-8">
            Tìm và ghép các cặp từ vựng và nghĩa tiếng Việt tương ứng nhanh nhất có thể!
          </p>
          <button
            onClick={startGame}
            className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
          >
            <PlayCircle size={20} />
            Bắt đầu chơi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <div className="flex items-center gap-2 text-xl font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <Clock size={20} className={!isFinished ? "animate-pulse" : ""} />
          {formatDuration(elapsed)}
        </div>
        
        {isFinished && (
          <button
            onClick={startGame}
            className="flex justify-center items-center gap-2 py-2 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-sm"
          >
            🔄 Chơi lại
          </button>
        )}
      </div>

      {isFinished && (
        <div className="w-full bg-green-50 border border-green-100 rounded-3xl p-8 text-center mb-8 animate-in slide-in-from-top-4 fade-in">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Hoàn thành xuất sắc!</h2>
          <p className="text-green-600">
            Bạn đã ghép đúng tất cả các thẻ trong {formatDuration(elapsed)}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {cards.map((card) => {
          const isSelected = selectedCards.some((c) => c.id === card.id)
          const isMatched = card.isMatched

          let btnClass = 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:shadow-md hover:-translate-y-1'
          if (isSelected) {
            btnClass = 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md scale-105'
          }
          if (isMatched) {
            btnClass = 'bg-green-50 border-green-200 text-transparent opacity-0 pointer-events-none'
          }
          if (selectedCards.length === 2 && isSelected) {
             const [first, second] = selectedCards
             if (first.wordId !== second.wordId) {
                // error state
                btnClass = 'bg-red-50 border-red-400 text-red-700 shadow-md animate-shake'
             }
          }

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched || mismatchWait || (isSelected && selectedCards.length === 1)}
              className={`min-h-[120px] p-4 rounded-2xl border-2 flex items-center justify-center text-center font-semibold text-lg transition-all duration-300 ${btnClass}`}
            >
              {card.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
