import { useForm, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import type * as z from 'zod';

/**
 * Generic hook for form validation with react-hook-form and zod
 *
 * Provides a type-safe wrapper around react-hook-form with zod resolver.
 *
 * @example
 * ```tsx
 * const { register, handleSubmit, formState: { errors } } = useFormValidation({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' },
 * });
 * ```
 */
export function useFormValidation<T extends ZodSchema>(
  options: Omit<UseFormProps<z.infer<T>>, 'resolver'> & {
    schema: T;
  }
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    ...options,
    resolver: zodResolver(options.schema),
    mode: options.mode || 'onBlur', // Default to onBlur for better UX
  });
}
