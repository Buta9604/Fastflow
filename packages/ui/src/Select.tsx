import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      placeholder,
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`

    const baseStyles =
      'flex h-10 w-full rounded-input border border-neutral-300 bg-surface px-3 py-2 text-sm transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-right pr-10'

    const errorStyles = error
      ? 'border-red-500 focus-visible:ring-red-500'
      : ''

    // Custom dropdown arrow using background image
    const arrowStyles = `bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"%3E%3Cpath stroke="%236b7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4"/%3E%3C/svg%3E')]`

    const selectClasses = `${baseStyles} ${errorStyles} ${arrowStyles} ${className}`

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-neutral-900"
          >
            {label}
            {required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            className={selectClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

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

Select.displayName = 'Select'

export { Select }
