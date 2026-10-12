import LabelBase from '~/components/form/label'

interface FormItemProps {
  label?: string
  children: React.ReactNode
  error?: string
  layout?: 'vertical' | 'horizontal'
  classNames?: {
    root?: string
    container?: string
    label?: string
    error?: string
  }
  isRequired?: boolean
}

const FormItem = ({
  label,
  children,
  error,
  layout = 'vertical',
  classNames,
  isRequired,
}: FormItemProps) => {
  return (
    <div className={['space-y-2', classNames?.root].filter(Boolean).join(' ')}>
      <div
        className={[
          'flex gap-2',
          layout === 'vertical' ? 'flex-col' : 'flex-row',
          classNames?.container,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label && <LabelBase label={label} isRequired={isRequired} />}
        {children}
      </div>
      {error && (
        <span className={['text-sm text-red-500', classNames?.error].filter(Boolean).join(' ')}>
          {error}
        </span>
      )}
    </div>
  )
}

export default FormItem
