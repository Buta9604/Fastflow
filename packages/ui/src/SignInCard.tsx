'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState, FormEvent } from 'react'
import { Button } from './Button'

export function SignInCard() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setIsSubmitted(true)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: '/' })
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="w-full max-w-md bg-surface border border-border rounded-card p-8 shadow-lg">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-accent-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-accent-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-4 h-4 bg-accent-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    )
  }

  // Signed in state
  if (session?.user) {
    return (
      <div className="w-full max-w-md bg-surface border border-border rounded-card p-8 shadow-lg">
        <div className="space-y-6">
          {/* User info */}
          <div className="text-center space-y-2">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User avatar'}
                className="w-16 h-16 rounded-full mx-auto border-2 border-accent-500"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {session.user.name || 'Welcome!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </div>

          {/* Sign out button */}
          <Button
            variant="outline"
            size="md"
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    )
  }

  // Email sent state
  if (isSubmitted) {
    return (
      <div className="w-full max-w-md bg-surface border border-border rounded-card p-8 shadow-lg">
        <div className="space-y-4 text-center">
          {/* Success icon */}
          <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-accent-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Check your email
            </h3>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Click the link in the email to sign in. It expires in 24 hours.
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsSubmitted(false)
              setEmail('')
            }}
            className="w-full"
          >
            Send another link
          </Button>
        </div>
      </div>
    )
  }

  // Sign in form
  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-card p-8 shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome to FlatFlow
          </h2>
          <p className="text-sm text-muted-foreground">
            Sign in with your email to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-border rounded-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-base"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? 'Sending magic link...' : 'Send magic link'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
