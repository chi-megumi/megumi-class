import type { InputHTMLAttributes } from 'react'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import InputBase from '~/components/form/input/InputBase'

interface InputProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  control: Control<T>
  label?: string
  error?: string
}

const InputControl = <T extends FieldValues>({ name, control, error, ...rest }: InputProps<T>) => {
  return (
    <div className="flex flex-col gap-1">
      <Controller
        name={name}
        control={control}
        render={({ field }) => <InputBase {...rest} {...field} id={name} error={!!error} />}
      />

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

export default InputControl
