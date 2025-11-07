'use client'

import { HTMLAttributes, forwardRef, useState } from 'react'

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  defaultCollapsed?: boolean
  collapsible?: boolean
  position?: 'left' | 'right'
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      defaultCollapsed = false,
      collapsible = true,
      position = 'left',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed)

    const baseStyles =
      'flex h-screen flex-col border-neutral-200 bg-surface transition-all duration-300'

    const positionStyles = position === 'left' ? 'border-r' : 'border-l'

    const widthStyles = collapsed ? 'w-16' : 'w-64'

    return (
      <aside
        ref={ref}
        className={`${baseStyles} ${positionStyles} ${widthStyles} ${className}`}
        role="complementary"
        aria-label="Sidebar"
        {...props}
      >
        {/* Header with collapse button */}
        {collapsible && (
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
            {!collapsed && (
              <span className="text-sm font-semibold text-neutral-900">
                Menu
              </span>
            )}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Navigation content */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Sidebar navigation">
          {children}
        </nav>
      </aside>
    )
  }
)

Sidebar.displayName = 'Sidebar'

// Sidebar item component
export interface SidebarItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string
  icon?: React.ReactNode
  active?: boolean
  collapsed?: boolean
}

const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(
  (
    {
      href = '#',
      icon,
      active = false,
      collapsed = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-base'

    const activeStyles = active
      ? 'bg-accent-100 text-accent-700'
      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'

    return (
      <a
        ref={ref}
        href={href}
        className={`${baseStyles} ${activeStyles} ${className}`}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? String(children) : undefined}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        {!collapsed && <span className="flex-1">{children}</span>}
      </a>
    )
  }
)

SidebarItem.displayName = 'SidebarItem'

// Sidebar section component
export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  collapsed?: boolean
}

const SidebarSection = forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ title, collapsed = false, className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`space-y-1 ${className}`} {...props}>
        {title && !collapsed && (
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {title}
          </h3>
        )}
        {children}
      </div>
    )
  }
)

SidebarSection.displayName = 'SidebarSection'

export { Sidebar, SidebarItem, SidebarSection }
