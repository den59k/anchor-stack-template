<template>
  <VFormControl class="v-input" :error="error" :label="label" :required="required" :class="{ large, disabled }">
    <div class="v-input__input-wrapper v-form-control__outline" :class="{ multiline }">
      <slot name="startAdornment"></slot>
      <div v-if="type === 'phone'" class="v-input__start-adornment">+7</div>
      <textarea 
        v-if="props.multiline" 
        ref="inputRef" 
        v-model="model" 
        :placeholder="props.placeholder" 
        :rows="props.rows" 
        class="scroll"
        :name="props.name"
      ></textarea>
      <input 
        v-else 
        ref="inputRef" 
        v-model="model" 
        :placeholder="props.placeholder" 
        :type="inputType"
        :name="props.name"
      />
      <div v-if="props.maxLength" class="v-input__max-length">{{ model.length }} / {{ props.maxLength }}</div>
    </div>
  </VFormControl>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { VFormControlProps } from '../utils/types';

const props = defineProps<{ 
  modelValue?: string | number | null,
  multiline?: boolean, 
  autofocus?: boolean,
  rows?: number, 
  placeholder?: string, 
  type?: "phone" | "number" | "password", 
  name?: string,
  large?: boolean,
  disabled?: boolean,
  maxLength?: number,
} & VFormControlProps>()
const emit = defineEmits(["update:modelValue"])

const parse = (value: string) => {
  if (props.type === "number") {
    const val = parseInt(value)
    if (isNaN(val)) return null
    return val
  }
  return value
}

let lastValue: number | null | string = ""

const model = ref("")
watch(() => props.modelValue, (value) => {
  if (value === lastValue) return
  model.value = (value ?? "").toString()
}, { immediate: true })

watch(() => model.value, (modelValue) => {
  const val = parse(modelValue)
  lastValue = val
  emit("update:modelValue", val)
})

const error = computed(() => {
  if (props.type === "number" && model.value && props.modelValue === null) {
    return { message: "Введите числовое значение" }
  }
  return props.error
})

const inputType = computed(() => {
  if (props.type !== "phone" && props.type !== "number") return props.type
  return undefined
})

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()
onMounted(() => {
  if (props.autofocus || props.error) {
    inputRef.value?.focus()
  }
})

</script>

<style lang="sass">

.v-input__input-wrapper
  display: flex
  border: 1px solid #DCE1EB
  height: 40px
  border-radius: 8px
  transition: border-color 0.12s
  font-size: 13px
  position: relative

  &:focus-within
    border-color: #AAAAAC

  &>svg
    align-self: center
    margin-left: 12px
    color: #CED4DA
    margin-right: -6px

  input, textarea
    height: 100%
    flex-grow: 1
    background: none
    border: none
    padding: 0 14px
    outline: none
    position: relative
    z-index: 1

    &::placeholder
      color: #C7CDD9

  &.multiline
    height: auto

    textarea
      padding: 8px 14px
      resize: none

.v-input__start-adornment
  width: 46px
  border-right: 1px solid #CED4DA
  display: flex
  align-items: center
  justify-content: center

  @media(max-width: 800px)
    width: 32px

.v-input__max-length
  position: absolute
  bottom: 2px
  right: 10px
  font-size: 12px
  color: #C8CCD0

.v-input.disabled .v-input__input-wrapper
  background-color: #F2F2F4
  pointer-events: none

.v-input.large .v-input__input-wrapper
  font-size: 16px
  height: 52px
  border-radius: 12px
  
  input
    padding: 0 16px

  @media(max-width: 800px)
    height: 38px
    font-size: 13px

</style>