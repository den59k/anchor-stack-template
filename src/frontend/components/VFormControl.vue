<template>
  <div class="v-form-control" :class="{ error: !!props.error }">
    <label v-if="!!props.label" class="v-form-control__label">
      {{ props.label }}<span v-if="props.required" class="v-form-control__required-marker">*</span>
    </label>
    <slot></slot>
    <Transition>
      <div v-if="!!props.error" class="v-form-control__error">
        {{ error }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { errors } from '../utils/errors';
import { VFormControlProps } from '../utils/types';

const props = defineProps<VFormControlProps>()

const error = computed(() => {
  if (!props.error) return ""
  const code = props.error["code"]
  if (code) {
    return errors[code as keyof typeof errors] ?? props.error.message ?? ""
  }
  return props.error.message ?? "Произошла ошибка"
})


</script>

<style lang="sass">

.v-form-control
  display: flex
  flex-direction: column
  align-items: stretch
  position: relative
  transition: padding-bottom 0.12s cubic-bezier(0.4, 0, 0.2, 1)

  &.error
    &:not(.disablePadding)
      padding-bottom: 16px

    .v-form-control__label
      color: var(--error-color)

    .v-form-control__outline
      border-color: var(--error-color)

.v-form-control__label
  font-size: 13px
  margin-bottom: 4px
  white-space: nowrap

.v-form-control__required-marker
  color: var(--primary-color)
  user-select: none
  margin-left: 0.15em

.v-form-control__error
  position: absolute
  bottom: 0
  font-size: 12px
  color: var(--error-color)
  transition: opacity 0.12s, transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)

  &.v-enter-from, &.v-leave-to
    opacity: 0

.v-form-control.disablePadding .v-form-control__error
  bottom: -16px
  &.v-enter-from, &.v-leave-to
    transform: translateY(-16px)


</style>