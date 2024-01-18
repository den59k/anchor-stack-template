import { computed, reactive, ref, watch } from "vue"
import { HTTPError } from "../utils/HTTPError"
import { cloneDeep, isEqual } from "lodash"

type Options<T> = {
  required?: Array<keyof T>
}

type Error = { code?: string, message?: string }

export const useForm = <T extends Record<string, any>>(defaultValues: T, options: Options<T> = {}) => {

  const pending = ref(false)
  const values = reactive(cloneDeep(defaultValues)) as T
  const errors = reactive<Partial<Record<keyof T, Error>>>({}) as Partial<Record<keyof T, Error>>

  const oldValues: { [key: string]: string } = {}
  watch(values, () => {
    for (let [ key, value ] of Object.entries(values)) {
      if (errors[key as keyof T] && value !== oldValues[key]) {
        delete errors[key as keyof T]
      }
    }
    Object.assign(oldValues, values)
  })

  const requiredSet = computed(() => {
    return new Set(options.required)
  })

  const setError = (key: keyof T, error: Error) => {
    (errors as any)[key] = error
  }

  const register = <K extends keyof T>(key: K) => {
    return {
      modelValue: values[key],
      "onUpdate:modelValue": (value: T[K]) => values[key] = value as any,
      error: errors[key],
      name: key,
      required: requiredSet.value.has(key)
    }
  }

  const checkRequired = (keys?: Array<keyof T>, setErrors = true) => {
    for (let key of (keys ?? options.required ?? [])) {
      const val = values[key]
      if (val === null || (typeof val === "string" && !val.trim() || (Array.isArray(val) && val.length === 0))) {
        if (setErrors) {
          setError(key, { code: "required" })
        }
        return false
      }
    }
    return true
  }

  const handleSubmit = (submit: (values: T) => void | Promise<void>) => async (e: Event) => {
    e.preventDefault()
    if (!checkRequired()) return

    pending.value = true
    try {
      await submit(values)
    } catch(e) {
      if (e instanceof HTTPError && typeof e.body?.error === "object") {
        for (let [key, error] of Object.entries(e.body.error)) {
          if (!(key in values)) continue
          if (typeof error === "string") {
            (errors as any)[key] = error as string
          } else if (typeof error === "object" && error) {
            (errors as any)[key] = error
          }
        }
      }
      
      throw e
    } finally {
      pending.value = false
    }
  }

  const updateDefaultValues = (newValues: Partial<T>) => {
    for (let [ key, value ] of Object.entries(newValues)) {
      if (key in values) {
        (values as any)[key] = value;
        (defaultValues as any)[key] = value
      }
    }
  }

  const changeFlag = ref(false)
  const setChange = () => {
    changeFlag.value = true
  }

  const hasChange = computed(() => {
    if (changeFlag.value) return true
    return !isEqual(defaultValues, values)
  })

  return {
    handleSubmit,
    register,
    setError,
    checkRequired,
    updateDefaultValues,
    pending,
    values,
    hasChange,
    setChange
  }
}