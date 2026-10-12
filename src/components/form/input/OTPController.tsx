import type { InputHTMLAttributes } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import OTPInput from '~/components/form/input/OTPInput'

interface OTPControllerProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  control: Control<T>
  error?: string
}

const OTPController = <T extends FieldValues>({ name, control, error }: OTPControllerProps<T>) => {
  return (
    <div className="">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <OTPInput value={field.value} onChange={field.onChange} error={!!error} />
        )}
      />
    </div>
  )
}

export default OTPController
