import { HTMLAttributes, forwardRef, useState } from 'react'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = '',
      fallback,
      size = 'md',
      shape = 'circle',
      className = '',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false)

    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    }

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-avatar',
    }

    const baseStyles = `relative inline-flex items-center justify-center overflow-hidden bg-accent-100 ${sizes[size]} ${shapes[shape]}`

    // Generate initials from fallback text
    const getInitials = (text?: string): string => {
      if (!text) return '?'
      const words = text.trim().split(/\s+/)
      if (words.length === 1) {
        return words[0].charAt(0).toUpperCase()
      }
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
    }

    const showImage = src && !imageError
    const initials = getInitials(fallback || alt)

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${className}`}
        role="img"
        aria-label={alt || fallback || 'Avatar'}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="font-medium text-accent-700"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

// Avatar Group for displaying multiple avatars
export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 3, size = 'md', className = '', children, ...props }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children]
    const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray
    const remaining = childrenArray.length - visibleChildren.length

    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    }

    return (
      <div
        ref={ref}
        className={`flex -space-x-2 ${className}`}
        role="group"
        aria-label="Avatar group"
        {...props}
      >
        {visibleChildren}
        {remaining > 0 && (
          <div
            className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-neutral-200 ${sizes[size]}`}
            role="img"
            aria-label={`${remaining} more`}
          >
            <span className="font-medium text-neutral-600">
              +{remaining}
            </span>
          </div>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = 'AvatarGroup'

export { Avatar, AvatarGroup }
