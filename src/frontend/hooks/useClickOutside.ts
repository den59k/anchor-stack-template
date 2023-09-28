import { Ref, WatchSource, watch } from "vue"

export const findParent = (el: HTMLElement, callback: (el: HTMLElement) => boolean): HTMLElement | null => {
  if (callback(el)) return el
  if (!el.parentElement) return null
  return findParent(el.parentElement, callback)
}

export const useClickOutside = (condition: WatchSource, onClick: () => void, ignoreEl?: Ref<HTMLElement | undefined>) => {

  const clickOutside = (e: MouseEvent) => {
    if (!ignoreEl || !ignoreEl.value) {
      onClick()
      return
    }
    const parent = findParent(e.target as HTMLElement, el => el === ignoreEl.value)
    if (!parent) {
      onClick()
    }
  }
  
  watch(condition, value => {
    setTimeout(() => {
      if (value) {
        document.addEventListener("click", clickOutside)
      } else {
        document.removeEventListener("click", clickOutside)
      }
    }, 50)
  }, { flush: "post" })
}