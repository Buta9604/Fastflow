import 'next-auth'

declare module 'next-auth' {
  /**
   * Extend the built-in session type with custom properties
   */
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
    }
  }

  /**
   * Extend the built-in user type
   */
  interface User {
    id: string
    email: string
    name: string
    emailVerified?: Date | null
    avatarUrl?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
