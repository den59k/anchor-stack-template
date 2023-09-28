import { HTTPError } from "../utils/HTTPError";

let jwt = ""
export const setJwt = (value: string) => {
  jwt = value
}

type Options = Partial<{
  method: "GET" | "POST" | "DELETE" | "PUT",
  responseContentType: "json" | "blob"
}>

export const request = async <T = any>(url: string, body?: any, options: Options = {}) => {

  const headers: { [key: string]: string} = {}
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json"
  }
  if (jwt) {
    headers["Authorization"] = "Bearer "+jwt
  }

  const resp = await fetch(url, {
    method: options.method || (body? "POST": "GET"),
    body: body? (body instanceof FormData? body: JSON.stringify(body)): undefined,
    headers
  })

  let response = null as T
  if (resp.headers.get("content-type")?.startsWith("application/json")) {
    response = await resp.json() as T
  }
  if (resp.headers.get("content-type")?.startsWith("text/plain")) {
    response = await resp.text() as T
  }

  if (resp.status >= 400) {
    throw new HTTPError(response, resp.status)
  }

  if (options.responseContentType === "blob"){
    response = await resp.blob() as T
  }

  return response as T
}