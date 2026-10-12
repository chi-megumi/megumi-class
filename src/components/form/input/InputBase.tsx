import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputBaseProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: boolean
}

const InputBase = forwardRef<HTMLInputElement, InputBaseProps>(
  ({ leftIcon, rightIcon, error, type = 'text', className = '', ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          className={[
            'h-10 w-full rounded-2xl border bg-white px-3',
            'outline-none transition',
            leftIcon && 'pl-10',
            (rightIcon || isPassword) && 'pr-10',
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 focus:border-primary focus:ring-primary/20',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
          >
            {showPassword ? '🙉' : '🙈'}
          </button>
        ) : (
          rightIcon && (
            <span className="absolute inset-y-0 right-3 flex items-center">{rightIcon}</span>
          )
        )}
      </div>
    )
  },
)

InputBase.displayName = 'InputBase'

export default InputBase
