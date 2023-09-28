import { Component, reactive, ref, shallowRef } from "vue"

export type MenuItem<T> = {
  title: string,
  icon?: Component,
  to?: string,
  onClick?: (item: T) => void,
  class?: string,
  children?: MenuItem<T>[]
}

type Options = {
  origin?: "top left" | "top right" | "bottom left" | "bottom right" | "top center" | "bottom center",
  placement?: "top left" | "top right" | "bottom left" | "bottom right" | "top center" | "bottom center",
  offsetY?: number,
  offsetX?: number,
  disableHideOnMouseLeave?: boolean
}

export const useContextMenu = <T>(creator: (item: T) => MenuItem<T>[], options: Options = {}) => {
  
  const open = ref(false)
  const menuItems = shallowRef<MenuItem<T>[]>([])
  const pos = reactive({ x: 0, y: 0 })
  const currentItem = shallowRef<T>()
  
  let anchorPosition: null | { x: number, y: number };
  let anchorElement: null | HTMLElement;

  const close = () => {
    open.value = false
  }

  const updatePos = () => {

    const [ placeV, placeH ] = (options.placement || "top left").split(" ")

    if (anchorPosition) {
      pos.x = Math.round(anchorPosition.x / 2) * 2
      pos.y = Math.round(anchorPosition.y / 2) * 2
    }
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect()
      pos.x = rect.left
      if (placeH === "right") pos.x = rect.right
      if (placeH === "center") pos.x = Math.trunc((rect.left + rect.right)/2)
      pos.y = placeV === "top"? rect.top: rect.bottom
    }
    if (options.offsetY) {
      pos.y += options.offsetY
    }
    if (options.offsetX) {
      pos.x += options.offsetX
    }
  }

  const onClick = (e: MouseEvent, item: T) => {
    menuItems.value = creator(item)
    open.value = true

    anchorElement = e.currentTarget as HTMLElement
    anchorPosition = null

    updatePos()
  }

  let openTimeout: ReturnType<typeof setTimeout> | null = null
  let closeTimeout: ReturnType<typeof setTimeout> | null = null
  let hover = false

  const onMouseLeave = (force?: boolean) => {
    if (!hover && force !== true) return
    if (openTimeout) clearTimeout(openTimeout)
    openTimeout = null
    if (closeTimeout) return

    closeTimeout = setTimeout(() => {
      open.value = false
      closeTimeout = null
    }, 150)
  }

  const onMouseEnter = (e: MouseEvent, item: T) => {
    if (openTimeout) clearTimeout(openTimeout)
    if (closeTimeout) clearTimeout(closeTimeout)
    closeTimeout = null

    anchorElement = e.currentTarget as HTMLElement
    anchorPosition = null

    openTimeout = setTimeout(() => {
      menuItems.value = creator(item)
      open.value = true

      if (!options.disableHideOnMouseLeave) {
        hover = true
      }

      updatePos()
    }, 100)
  }

  const onMenuMouseEnter = () => {
    if (closeTimeout) {
      clearTimeout(closeTimeout)
      closeTimeout = null
    }
  }

  const onContextMenu = (e: MouseEvent, item: T) => {
    menuItems.value = creator(item)
    currentItem.value = item
    if (menuItems.value.length === 0) return
    e.preventDefault()
    open.value = true

    anchorElement = null
    anchorPosition = { x: e.clientX, y: e.clientY - 8 }
    
    updatePos()
  }

  return {
    menuItems,
    open,
    currentItem,
    onContextMenu,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onMenuMouseEnter,
    close,
    options,
    pos
  }

}