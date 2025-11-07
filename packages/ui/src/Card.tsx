import { HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-card bg-surface transition-base'

    const variants = {
      default: 'border border-neutral-200',
      outlined: 'border-2 border-accent-200',
      elevated: 'shadow-md hover:shadow-lg',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    const classes = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components for semantic structure
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 pb-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-lg font-semibold leading-none tracking-tight text-neutral-900 ${className}`}
        {...props}
      >
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = 'CardTitle'

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-sm text-neutral-600 ${className}`}
        {...props}
      >
        {children}
      </p>
    )
  }
)

CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center pt-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
