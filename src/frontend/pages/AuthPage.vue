<template>
  <div class="auth-page__container">
    <VCard tag="form" class="auth__form" @submit="onSubmit">
      <h5>Вход в админ-панель</h5>
      <VInput v-bind="register('login')"  label="Логин" placeholder="Введите ваш логин" />
      <VInput v-bind="register('password')" label="Пароль" placeholder="Введите ваш пароль" type="password"/>
      <VButton type="submit" :disabled="pending">Войти</VButton>
    </VCard>
    <div class="auth__big-label">Anchor Stack Template</div>
  </div>
</template>

<script lang="ts" setup>
import { useAccountStore } from '../stores/accountStore';
import { useRouter } from 'vue-router';
import { useForm } from '../hooks/useForm'

const { pending, handleSubmit, register } = useForm({ login: "", password: "" }, { required: [ "login", "password" ] })
const router = useRouter()
const accountStore = useAccountStore()

const onSubmit = handleSubmit(async ({ login, password }) => {
  await accountStore.login(login, password)
  router.push("/")
})

</script>

<style lang="sass">

.auth-page__container
  display: flex
  flex: 1 1 auto
  justify-content: center
  align-items: center
  flex-direction: column

.auth__form
  display: flex
  flex-direction: column
  gap: 20px
  width: 350px
  position: relative
  z-index: 1

  &>.v-button
    align-self: flex-start


.auth__big-label
  position: absolute
  bottom: 24px
  left: 60px
  z-index: 0
  font-size: 96px
  font-weight: 700
  color: #EBEDF0

</style>