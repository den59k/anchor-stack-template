export class HTTPError extends Error {
  body: any
  statusCode: number

  constructor(body: any, statusCode: number = 401) {
    super()
    this.body = body
    this.statusCode = statusCode
  }
}