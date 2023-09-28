import { FastifySchema } from "fastify";

type SchemaName = 'body' | 'params' | 'querystring' | 'headers'

type BaseJSONObjectType = "number" | "string" | "boolean" | "object" | "array"
type JSONObjectType = BaseJSONObjectType | "number?" | "string?" | "boolean?" | "object?" | "array?" | "string??" | "number??"

type StringTypes = "date" | "uri" | "uuid" | "password" | "binary" | "date-time"

type Properties = { [ key: string ]: JSONObjectType | Properties | string[] } | 
  { type: "string" | "string?" | "string??", format?: StringTypes } |
  { type: "array" | "array?", items?: Properties | JSONObjectType | string[], minItems?: number, maxItems?: number } |
  { type: "number" | "number?", maximum?: number, minimum?: number } |
  { type: "string" | "string?", minLength?: number, maxLength?: number, patern?: string }

export const sc = (...schemas: Array<FastifySchema | { consumes?: string[] }>)  => {
  return {
    schema: Object.assign({}, ...schemas) as FastifySchema
  }
}

export const schema = <T extends Properties | JSONObjectType, K extends SchemaName = "body">(properties: T, key?: K): { [key in K]: any } => {

	const schema = {
		[key ?? "body"]: getSchema(properties)
	}

	return schema as { [key in K]: any }
}

type MapTypes = {
  "number": number,
  "number?": number | undefined,
  "string": string,
  "string?": string | undefined,
  "boolean": boolean,
  "boolean?": boolean | undefined,
  "object": object,
  "object?": object | undefined,
  "array": Array<any>,
  "array?": Array<any> | undefined,
}

type MapTypes2 = {
  "number?": "number",
  "string?": "string",
  "boolean?": "boolean",
  "object?": "object",
  "array?": "array",
}

const getType = (type: JSONObjectType) => {
  if (type.endsWith("??")) return type.slice(0, -2)
  if (type.endsWith("?")) return type.slice(0, -1)
  return type
}

export const getSchema = <T extends (Properties | string[] | JSONObjectType)>(obj: T): any => {
	const required: string[] = []

  if (typeof obj === "string") {
    return { 
      type: getType(obj), 
      nullable: obj.endsWith("??")? true: undefined 
    }
  }

  if (Array.isArray(obj)) {
    return { type: "string", enum: obj }
  }

  if (typeof obj !== "object") throw new Error(`Field ${obj} is not object`)
  
  if ("type" in obj && typeof obj.type === "string") {
    return {
      ...obj,
      type: getType(obj.type),
      nullable: obj.type.endsWith("??")? true: undefined,
      items: ("items" in obj && obj.items)? getSchema(obj.items): undefined
    }
  }

	const _props: { [ key: string ]: object | string } = {}

	for (let [key, value] of Object.entries(obj)) {
    if (typeof value === "number") continue

    if (typeof value !== "object" || Array.isArray(value)) {
      if (typeof value !== "string" || !value.endsWith("?")) {
        required.push(key)
      }
      _props[key] = getSchema(value)
      continue 
    }

    if (!("type" in value) || typeof value.type !== "string" || !value.type.endsWith("?")) {
      required.push(key)
    }
    _props[key] = getSchema(value)
	}

	return {
		type: "object",
		properties: _props,
		required
	}
}

export const removeRequired = (schema: { required: string[] }, ...keys: string[]) => {
  if (keys.length === 0) {
    schema.required = []
    return
  }
  schema.required = schema.required.filter(key => !keys.includes(key))
}