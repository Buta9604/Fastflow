import { NextResponse } from 'next/server'

export type ApiResponse<T = any> = {
  data?: T
  error?: string
  message?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      message: 'Success',
    },
    { status }
  )
}

export function errorResponse(
  error: string | Error,
  status: number = 500
): NextResponse<ApiResponse> {
  const message = error instanceof Error ? error.message : error

  return NextResponse.json(
    {
      error: message,
    },
    { status }
  )
}

export function validationErrorResponse(
  errors: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      error: 'Validation failed',
      data: errors,
    },
    { status: 400 }
  )
}
