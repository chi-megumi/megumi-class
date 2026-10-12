import type { ButtonHTMLAttributes, ReactNode } from 'react'
import '~/common/styles/components/Button.scss'
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  variant = 'ghost',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={['btn', `btn--${variant}`, `btn--${size}`, fullWidth ? 'btn--full' : '', className]
        .filter(Boolean)
        .join(' ')}
      type={type}
      {...rest}
    >
      {children}
    </button>
  )
}
