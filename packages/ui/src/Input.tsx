import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const baseStyles =
      'flex h-10 w-full rounded-input border border-neutral-300 bg-surface px-3 py-2 text-sm transition-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

    const errorStyles = error
      ? 'border-red-500 focus-visible:ring-red-500'
      : ''

    const widthStyles = fullWidth ? 'w-full' : ''

    const inputClasses = `${baseStyles} ${errorStyles} ${className}`

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            {label}
            {required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-neutral-600"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
