import { request } from "./request"

type Credentials = { login: string, password: string }

export const accountApi = {
  login(values: Credentials) {
    return request("/api/admin/login", values)
  },
  getUserInfo() {
    return request("/api/admin/account")
  }
}