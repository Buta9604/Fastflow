'use client'

import { HTMLAttributes, useEffect, useRef, forwardRef, MouseEvent } from 'react'
import { createPortal } from 'react-dom'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      size = 'md',
      closeOnBackdropClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const previousActiveElement = useRef<HTMLElement | null>(null)

    // Handle escape key
    useEffect(() => {
      if (!isOpen || !closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, closeOnEscape, onClose])

    // Handle focus trap and restoration
    useEffect(() => {
      if (isOpen) {
        // Save current focused element
        previousActiveElement.current = document.activeElement as HTMLElement

        // Focus modal
        modalRef.current?.focus()

        // Prevent body scroll
        document.body.style.overflow = 'hidden'
      } else {
        // Restore focus
        previousActiveElement.current?.focus()

        // Restore body scroll
        document.body.style.overflow = ''
      }

      return () => {
        document.body.style.overflow = ''
      }
    }, [isOpen])

    // Handle backdrop click
    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdropClick && e.target === e.currentTarget) {
        onClose()
      }
    }

    if (!isOpen) return null

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full m-4',
    }

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleBackdropClick}
        role="presentation"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={`relative z-50 w-full ${sizes[size]} rounded-card bg-surface shadow-xl transition-all ${className}`}
          {...props}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-surface transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {children}
        </div>
      </div>
    )

    return createPortal(modalContent, document.body)
  }
)

Modal.displayName = 'Modal'

// Sub-components for semantic structure
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 px-6 py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ModalHeader.displayName = 'ModalHeader'

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={`text-lg font-semibold leading-none tracking-tight text-neutral-900 ${className}`}
        {...props}
      >
        {children}
      </h2>
    )
  }
)

ModalTitle.displayName = 'ModalTitle'

export interface ModalDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
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

ModalDescription.displayName = 'ModalDescription'

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {}

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`px-6 py-4 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

ModalContent.displayName = 'ModalContent'

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-end gap-2 px-6 py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter }
