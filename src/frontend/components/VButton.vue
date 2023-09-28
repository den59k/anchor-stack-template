<template>
  <button class="v-button" :class="{ disabled, flat }">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
defineProps<{ disabled?: boolean, flat?: boolean }>()

</script>

<style lang="sass">

.v-button
  background-color: var(--primary-color)
  height: 40px
  color: white
  font-weight: 600
  border-radius: 6px
  font-size: 13px
  padding: 0 28px

  &:hover
    background-color: var(--primary-color-hover)
    
  &:active 
    background-color: var(--primary-color-active)

  &.disabled
    opacity: 0.5

  &.flat
    background: none
    color: var(--primary-color)

    &:hover
      background-color: rgba(#DC3545, 0.08)
</style>