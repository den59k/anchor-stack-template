export type Error = { code?: string, message?: string }

export type VFormControlProps = {
  error?: Error,
  label?: string,
  required?: boolean
}