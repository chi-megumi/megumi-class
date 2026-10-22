'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface ValidatedNumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  placeholder?: string
  id?: string
  ariaLabel?: string
  disabled?: boolean
}

export function ValidatedNumberInput({
  value,
  onChange,
  min = 1,
  max = 100,
  className = '',
  placeholder = '',
  id,
  ariaLabel,
  disabled = false,
}: ValidatedNumberInputProps) {
  const [text, setText] = useState<string>(() => (value != null ? String(value) : ''))
  const isFocusedRef = useRef(false)

  // Synchronize internal text state when external value prop changes while not actively focused
  useEffect(() => {
    if (!isFocusedRef.current) {
      setText(value != null ? String(value) : '')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Remove non-digit characters
    let digits = raw.replace(/\D/g, '')

    // Remove leading zeros if more than 1 digit (e.g. "05" -> "5")
    if (digits.length > 1 && digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '')
    }

    // Allow user to completely clear the input while typing
    if (digits === '') {
      setText('')
      return
    }

    let parsed = parseInt(digits, 10)
    // Prevent typing numbers larger than max
    if (parsed > max) {
      parsed = max
      digits = String(max)
    }

    setText(digits)

    // Only broadcast change if value is valid and >= min
    if (parsed >= min && parsed <= max) {
      onChange(parsed)
    }
  }

  const handleBlur = () => {
    isFocusedRef.current = false
    let parsed = parseInt(text, 10)
    if (isNaN(parsed) || parsed < min) {
      parsed = min
    } else if (parsed > max) {
      parsed = max
    }
    setText(String(parsed))
    onChange(parsed)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true
    // Auto-select text so typing immediately replaces the previous value
    e.currentTarget.select()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const current = parseInt(text, 10) || min
      const next = Math.min(max, current + 1)
      setText(String(next))
      onChange(next)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const current = parseInt(text, 10) || min
      const next = Math.max(min, current - 1)
      setText(String(next))
      onChange(next)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      id={id}
      aria-label={ariaLabel}
      value={text}
      disabled={disabled}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
    />
  )
}

export default ValidatedNumberInput
