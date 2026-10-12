import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react'
import '~/common/styles/components/OTPInput.scss'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: boolean
  disabled?: boolean
}

const OTPInput = ({ length = 6, value, onChange, error, disabled }: OTPInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [focused, setFocused] = useState<number | null>(null)

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const focusAt = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index))
    inputRefs.current[clamped]?.focus()
  }

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return
    const newDigits = [...digits]
    newDigits[index] = char.slice(-1)
    const newValue = newDigits.join('')
    onChange(newValue)
    if (char && index < length - 1) focusAt(index + 1)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits]
        newDigits[index] = ''
        onChange(newDigits.join(''))
      } else if (index > 0) {
        focusAt(index - 1)
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft') {
      focusAt(index - 1)
    } else if (e.key === 'ArrowRight') {
      focusAt(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted.padEnd(length, '').slice(0, length))
    const focusIndex = Math.min(pasted.length, length - 1)
    focusAt(focusIndex)
  }

  return (
    <div className="otp-input">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          className={[
            'otp-input__cell',
            error ? 'otp-input__cell--error' : '',
            focused === i ? 'otp-input__cell--focused' : '',
            digit ? 'otp-input__cell--filled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(null)}
          aria-label={`OTP digit ${i + 1}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}

export default OTPInput
