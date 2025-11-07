'use client'

import { HTMLAttributes, forwardRef, useState } from 'react'

export interface TopNavProps extends HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  actions?: React.ReactNode
  mobileMenuButton?: boolean
}

const TopNav = forwardRef<HTMLElement, TopNavProps>(
  (
    {
      logo,
      actions,
      mobileMenuButton = true,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const baseStyles =
      'sticky top-0 z-40 w-full border-b border-neutral-200 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60'

    return (
      <nav
        ref={ref}
        className={`${baseStyles} ${className}`}
        role="navigation"
        aria-label="Main navigation"
        {...props}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo section */}
          {logo && (
            <div className="flex items-center gap-2">
              {logo}
            </div>
          )}

          {/* Desktop navigation */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
            {children}
          </div>

          {/* Actions section */}
          <div className="flex items-center gap-2">
            {actions}

            {/* Mobile menu button */}
            {mobileMenuButton && (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500 md:hidden"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 md:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {children}
            </div>
          </div>
        )}
      </nav>
    )
  }
)

TopNav.displayName = 'TopNav'

// Nav link component
export interface TopNavLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string
  active?: boolean
}

const TopNavLink = forwardRef<HTMLAnchorElement, TopNavLinkProps>(
  ({ href = '#', active = false, className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center px-3 py-2 text-sm font-medium transition-base rounded-md'

    const activeStyles = active
      ? 'text-accent-700 bg-accent-50'
      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50'

    return (
      <a
        ref={ref}
        href={href}
        className={`${baseStyles} ${activeStyles} ${className}`}
        aria-current={active ? 'page' : undefined}
        {...props}
      >
        {children}
      </a>
    )
  }
)

TopNavLink.displayName = 'TopNavLink'

export { TopNav, TopNavLink }
