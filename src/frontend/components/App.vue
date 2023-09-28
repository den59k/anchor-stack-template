<template>
  <div v-if="accountStore.status === 'init'"></div>
  <div v-else class="app">
    <template v-if="showMenu">
      <TheMainSidebar/>
      <div class="app-content scroll">
        <router-view/>
      </div>
    </template>
    <router-view v-else />
    <TheDialogBase/>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useAccountStore } from '../stores/accountStore';
import { useRouter } from 'vue-router';
import TheMainSidebar from './TheMainSidebar.vue'
import TheDialogBase from './TheDialogBase.vue';

const accountStore = useAccountStore()
onMounted(() => {
  accountStore.init()
})

const router = useRouter()
const showMenu = computed(() => {
  const routeName = router.currentRoute.value.name as string
  if (routeName === "404") return false
  if (router.currentRoute.value.path.startsWith("/auth")) return false
  return true
})

</script>

<style lang="sass">

.app
  display: flex
  height: 100vh

.app-content
  flex: 1 1 auto
  display: flex
  flex-direction: column
  overflow-y: auto
  padding: 24px 40px

  h1
    margin: 0
    margin-bottom: 40px

</style>