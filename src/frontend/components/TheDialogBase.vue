<template>
  <Teleport to="body">
    <Transition>
      <div v-if="dialogStore.length > 0" class="v-dialog-backdrop" @mousedown="onMouseDown" @mouseup="onMouseUp">
        <div 
          v-for="(dialog, index) in dialogStore.dialogHistory" 
          v-show="index === dialogStore.length-1" 
          class="v-dialog bd-scale scroll"
          :class="getClass(dialog)"
        >
          <component :is="dialog.dialog" v-bind="dialog.props"/>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { useDialogStore } from '../stores/dialog';
import { useKeyDownStore } from '../stores/keydown';
import { watch } from 'vue';

const dialogStore = useDialogStore()

useKeyDownStore().watch("Escape", () => dialogStore.length > 0, () => dialogStore.back())

let mouseDown = false
const onMouseDown = (e: MouseEvent) => {
  mouseDown = e.target === e.currentTarget
}
const onMouseUp = (e: MouseEvent) => {
  if (!mouseDown || e.target !== e.currentTarget) {
    mouseDown = false
    return
  }
  dialogStore.back()
}

useKeyDownStore().watch("Escape", () => dialogStore.length > 0, () => {
  dialogStore.back()
})

const getClass = (_dialog: typeof dialogStore.dialogHistory[number]) => {
  return ""
}

watch(() => dialogStore.length > 0, (value) => {
  if (value) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflowY = "hidden"
    document.body.style.paddingRight = scrollbarWidth+"px"
  } else {
    document.body.style.paddingRight = ""
    document.body.style.overflowY = "auto"
  }
})


</script>

<style lang="sass">
.v-dialog-backdrop
  position: fixed
  top: 0
  bottom: 0
  right: 0
  left: 0
  background-color: rgba(0, 0, 0, 0.75)
  display: flex
  align-items: center
  justify-content: center
  z-index: 2000

  &.v-enter-active, &.v-leave-active 
    transition: opacity 0.14s ease
    .v-dialog
      transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1)

  &.v-enter-from, &.v-leave-to 
    opacity: 0

    .v-dialog
      transform: scale(0.8)

.v-dialog
  background-color: white
  border-radius: 16px
  position: relative
  max-height: 86vh
  max-width: 94vw

  @media(max-width: 800px)
    &:not(.confirmDialog)
      position: fixed
      max-width: unset
      max-height: unset
      top: 0
      bottom: 0
      right: 0
      left: 0
      max-height: stretch
      max-width: stretch
      margin: 0
      border-radius: 0

  .form-group
    padding: 0 32px

    @media(max-width: 800px)
      padding: 0 16px

  .dialog-content
    padding: 0 40px
    padding-bottom: 36px

  .dialog-actions
    display: flex
    padding: 0 32px
    justify-content: flex-start
    padding-top: 40px
    padding-bottom: 32px

    .v-button
      min-width: 130px
      height: 38px
      font-size: 13px
    
    @media(max-width: 800px)
      padding: 0 16px
      padding-top: 32px
      padding-bottom: 24px
      flex-direction: column
      align-items: stretch

  &::-webkit-scrollbar-track
    margin: 8px

</style>