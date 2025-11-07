import { NextRequest } from 'next/server'
import { ZodSchema } from 'zod'
import { ApiError, errorResponse, validationErrorResponse } from './response'

export type RouteHandler<T = any> = (
  req: NextRequest,
  context?: any
) => Promise<Response> | Response

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof ApiError) {
        return errorResponse(error.message, error.statusCode)
      }

      console.error('Unhandled error in API route:', error)
      return errorResponse('Internal server error', 500)
    }
  }
}

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, data: T, context?: any) => Promise<Response> | Response
): RouteHandler {
  return async (req: NextRequest, context?: any) => {
    try {
      const body = await req.json()
      const result = schema.safeParse(body)

      if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        return validationErrorResponse(errors as Record<string, string[]>)
      }

      return await handler(req, result.data, context)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return errorResponse('Invalid JSON in request body', 400)
      }
      throw error
    }
  }
}
