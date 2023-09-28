import { request } from "./request"

type Credentials = { login: string, password: string }

export const accountApi = {
  login(values: Credentials) {
    return request("/api/account/login", values)
  },
  getUserInfo() {
    return request("/api/account")
  }
}