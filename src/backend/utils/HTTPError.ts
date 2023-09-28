export class HTTPError extends Error {
  body: any
  statusCode: number

  constructor(body: Record<string, { code?: string, message: string }> | string, statusCode: number = 400) {
    super()
    this.body = body
    this.statusCode = statusCode
  }
}