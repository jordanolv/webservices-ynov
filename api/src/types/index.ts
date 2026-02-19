export type ApiSuccess<T> = { success: true; data: T }
export type ApiError = { success: false; message: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} introuvable`)
  }
}
