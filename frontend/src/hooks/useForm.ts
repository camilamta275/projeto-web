import { useForm as useReactHookForm, UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'

interface UseFormOptions<T extends ZodSchema> extends Omit<UseFormProps, 'resolver'> {
  schema: T
}

export function useForm<T extends ZodSchema>(options: UseFormOptions<T>) {
  return useReactHookForm({
    ...options,
    resolver: zodResolver(options.schema),
  })
}
