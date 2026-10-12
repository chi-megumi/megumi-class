import type { LabelHTMLAttributes } from 'react'

interface LabelBaseProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label?: string
  isRequired?: boolean
  classNames?: {
    root?: string
    label?: string
  }
}

const LabelBase = ({ label, isRequired, classNames, ...res }: LabelBaseProps) => {
  const { id } = res
  return (
    <div className={['flex items-center gap-2', classNames?.root].filter(Boolean).join(' ')}>
      <label
        htmlFor={id}
        className={['text-sm font-medium', classNames?.label].filter(Boolean).join(' ')}
      >
        {label}
      </label>
      {isRequired && <span className="text-red-400">*</span>}
    </div>
  )
}

export default LabelBase
