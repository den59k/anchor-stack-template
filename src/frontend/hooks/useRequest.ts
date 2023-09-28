import { UnwrapRef, onBeforeUnmount, onMounted, ref } from "vue"
import MultiMap from "../utils/multimap"

const dataMap = new Map<any, Map<string, any>>()
const events = new MultiMap<any, () => void>()

export const useRequest = <A extends any[], R>(request: (...args: A) => Promise<R>, ...args: A) => {

  const argKey = args.length === 0? "_default": JSON.stringify(args)
  const defaultValue = dataMap.get(request)?.get(argKey) ?? null
  const pending = ref(defaultValue === null)
  
  const data = ref<R | null>(defaultValue)
  const error = ref(false)

  let lastArgs = [] as any[] as A
  const mutate = async (...args: A) => {
    lastArgs = args
    const argKey = args.length === 0? "_default": JSON.stringify(args)
    const defaultValue = dataMap.get(request)?.get(argKey) ?? null

    data.value = defaultValue
    pending.value = defaultValue === null

    try {
      const resp = await request(...args) as UnwrapRef<R>
      data.value = resp 

      let map = dataMap.get(request)
      if (!map) {
        map = new Map()
        dataMap.set(request, map)
      }
      map.set(argKey, resp)

    } catch (e) {
      error.value = true
      throw e
    } finally { 
      pending.value = false
    }
  }
  
  const mutateWithLastArgs = () => mutate(...lastArgs)

  onMounted(() => mutate(...args))

  onMounted(() => {
    events.add(request, mutateWithLastArgs)
  })
  onBeforeUnmount(() => {
    events.remove(request, mutateWithLastArgs)
  })

  return { data, error, pending, mutate }
}

export const mutateRequest = (request: (...args: any) => Promise<any>) => {
  events.forEach(request, callback => callback())
  dataMap.delete(request)
}