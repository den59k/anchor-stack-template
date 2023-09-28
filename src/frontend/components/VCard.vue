<template>
  <component :is="props.tag ?? 'div'" class="v-card" :class="{ disablePadding }">
    <slot></slot>
  </component>
</template>

<script lang="ts" setup>

const props = defineProps<{ tag?: string, disablePadding?: boolean }>()

</script>

<style lang="sass">

.v-card
  border: 1px solid var(--border-color)
  background-color: white
  min-height: 50px
  display: flex
  flex-direction: column
  padding: 24px 30px
  border-radius: 8px

  h5
    font-size: 16px
    margin: 0

  &.disablePadding
    padding: 0

.v-card__header
  height: 64px
  border-bottom: 1px solid var(--border-color)
  display: flex
  align-items: center
  padding: 0 24px
  flex-shrink: 0

  .title
    font-weight: 700
    padding-right: 40px

  .v-input, .v-button
    height: 38px
    

</style>