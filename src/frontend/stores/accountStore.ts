import { defineStore } from "pinia";
import { setJwt } from "../api/request";
import { ref } from "vue";
import { HTTPError } from "../utils/HTTPError";
import { accountApi } from "../api/account";
import { useRouter } from "vue-router";

export const useAccountStore = defineStore('account', () => {

  const status = ref<"init" | "authorized" | "not-authorized">("init")
  const currentUser = ref<{ id: number, login: string }>()

  const init = async () => {
    const router = useRouter()
    const token = window.localStorage.getItem("accessToken-admin")
    if (!token) {
      status.value = "not-authorized"
      router.push("/auth")
      return
    }

    try {
      setJwt(token)
      currentUser.value = await accountApi.getUserInfo()
      status.value = "authorized"
    } catch(e) {
      if (e instanceof HTTPError && e.statusCode === 401) {
        status.value = "not-authorized"
        router.push("/auth")
      }
    }
  }

  const login = async (login: string, password: string) => {
    const resp = await accountApi.login({ login, password })
    currentUser.value = { id: resp.id, login: resp.login }
    setJwt(resp.accessToken)
    window.localStorage.setItem("accessToken-admin", resp.accessToken)
    
    status.value = "authorized"
  }

  const logout = () => {
    window.localStorage.removeItem("accessToken-admin")
    setJwt("")
    status.value = "not-authorized"
  }

  return {
    init,
    login,
    logout,
    status,
    currentUser
  }
})