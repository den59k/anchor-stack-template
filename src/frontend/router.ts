import { createRouter, createWebHistory } from "vue-router";
import HomePage from './pages/HomePage.vue'
import AuthPage from './pages/AuthPage.vue'
import TablePage from './pages/TablePage.vue'
import { useAccountStore } from "./stores/accountStore";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomePage },
    { path: "/auth", component: AuthPage },
    // { path: "/:table", component: TablePage }
  ]
})

router.beforeEach((to) => {
  const accountStore = useAccountStore()
  if (to.path.startsWith("/auth")) return
  if (accountStore.status === "not-authorized") {
    return '/auth'
  } else {
    
  }
})
