<template>
  <div class="the-main-sidebar">
    <div class="site-name">Anchor Stack Template</div>
    <nav class="the-main-sidebar__list">
      <!-- <router-link 
        v-for="(item, key) in tables" :to="`/${key}`" 
        class="the-main-sidebar__button" 
        :class="{ active: currentRoute === key }"
      >
        {{ item.title }}
      </router-link> -->
    </nav>
    <button class="the-main-sidebar__button the-main-sidebar__current-user" @click="logout">
      <VIcon icon="logout" />Выйти из аккаунта
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useAccountStore } from '../stores/accountStore';

const accountStore = useAccountStore()
const router = useRouter()

// const currentRoute = computed(() => {
//   for (let [key,value] of Object.entries(tables)) {
//     if ("/"+key === router.currentRoute.value.path || router.currentRoute.value.path.startsWith("/"+key+"/")) {
//       return key
//     }
//   }
//   return null
// })

const logout = () => {
  accountStore.logout()
  router.push("/auth")
}

</script>

<style lang="sass">

.the-main-sidebar
  border-right: 1px solid var(--border-color)
  background-color: white
  width: 240px
  display: flex
  flex-direction: column
  flex-shrink: 0

  .site-name
    font-weight: 700
    height: 64px
    display: flex
    align-items: center
    padding: 0 20px
    font-size: 16px

.the-main-sidebar__list
  display: flex
  flex-direction: column
  gap: 4px
  margin-top: 8px

.the-main-sidebar__button
  text-decoration: none
  display: flex
  align-items: center
  height: 40px
  padding: 0 12px
  color: var(--text-color)
  margin: 0 10px
  border-radius: 8px
  font-size: 13px
  font-weight: 500
  gap: 12px
  flex-shrink: 0
  text-align: start

  &:hover
    background-color: #F7F9FB

  &.active
    background-color: rgba(#DC3545, 0.08)
    color: #DC3545

.the-main-sidebar__current-user
  margin-top: auto
  margin-bottom: 12px

</style>