import ts from 'typescript'
import path from 'path'
import fs from 'fs'
import url from 'url'
import fastify from 'fastify'

const PROJECT_TITLE = "Anchor Stack OpenAPI"
const PROJECT_DESCRIPTION = "Stack for fast deploying apps"

const prefix = "/api"
const rootDir = path.join(process.cwd(), "src/backend/routes")

const readDir = (dir: string, callback: (filePath: string) => void) => {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  items.sort((a, b) => (a.isDirectory()? 1: 0) - (b.isDirectory()? 1: 0))
  for (let file of items) {
    if (file.isDirectory()) {
      readDir(path.join(dir, file.name), callback)
      continue
    }
    callback(path.join(dir, file.name))
  }
}

const tireReg = /^\s?-\s?/

const files: string[] = []
readDir(rootDir, file => files.push(file))

readDir(path.join(process.cwd(), "src/backend/plugins"), file => {
  if (file.endsWith(".d.ts")) {
    files.push(file)
  }
})

const program = ts.createProgram(files, { strictNullChecks: true, strict: true })
const typeChecker = program.getTypeChecker()

const isNullNode = (obj: ts.TypeNode) => {
  if (ts.isLiteralTypeNode(obj) && (obj.literal.kind === ts.SyntaxKind.NullKeyword || obj.literal.kind === ts.SyntaxKind.UndefinedKeyword)) {
    return true
  }
  if (ts.isToken(obj) && (obj.kind === ts.SyntaxKind.NullKeyword || obj.kind === ts.SyntaxKind.UndefinedKeyword)) {
    return true
  }
  return false
}

const isNullable = (item: ts.PropertySignature) => {
  if (item.questionToken) return true
  if (!item.type) return true
  
  if (!ts.isUnionTypeNode(item.type)) return false
  for (let obj of item.type.types) {
    if (isNullNode(obj)) return true
  }

  return false
}

const objectToEnum = (_type: ts.TypeLiteralNode) => {
  return {
    type: "string",
    enum: _type.members.map(item => {
      if (!ts.isPropertySignature(item)) return ""
      if (!item.type) return ""
      if (!ts.isLiteralTypeNode(item.type) || !ts.isStringLiteral(item.type.literal)) return ""
      return item.type.literal.text
    }).filter(item => !!item)
  }
}

const typeToSchema = (type: ts.TypeNode): any => {
  if (!type) return

  if (ts.isParenthesizedTypeNode(type)) {
    return typeToSchema(type.type)
  }

  if (ts.isUnionTypeNode(type)) {
    const types = type.types.filter(type => !isNullNode(type))
    if (types.length === 0) return undefined
    if (types.length === 1) return typeToSchema(types[0])
    return {
      anyOf: type.types.map(type => typeToSchema(type)).filter(item => !!item)
    }
  }

  if (ts.isIntersectionTypeNode(type)) {
    const required = []
    const properties = {}

    for (let item of type.types) {
      const _type = typeToSchema(item)
      if (!_type || !_type.properties) {
        continue
      }
      Object.assign(properties, _type.properties)
      required.push(...(_type.required ?? []))
    }

    return {
      type: "object",
      properties,
      required
    }
  }

  if (ts.isTypeReferenceNode(type)) {
    if (!ts.isIdentifier(type.typeName)) return

    if (type.typeName.escapedText === "Date") {
      return { type: "string", format: "date" }
    }

    const _type = (type.typeName as any).symbol?.valueDeclaration?.type ?? (type.typeName as any).symbol?.declarations[0].type
    if (_type) {
      const isEnum = (type.typeName as any).symbol.parent?.escapedName === "$Enums"
      if (isEnum && ts.isTypeLiteralNode(_type)) {
        return objectToEnum(_type)
      }
      return typeToSchema(_type)
    }
  }

  if (ts.isArrayTypeNode(type)) {
    return {
      type: "array",
      items: typeToSchema(type.elementType)
    }
  }

  if (ts.isTypeLiteralNode(type)) {
    const required: string[] = []
    return {
      type: "object",
      properties: Object.fromEntries(
        type.members.map(item => {
          if (!ts.isPropertySignature(item)) return []
          const name = ts.isIdentifier(item.name)? item.name.escapedText: '_'
          if (!isNullable(item)) {
            required.push(name as string)
          }
          return [ 
            name,
            typeToSchema(item.type!)
          ]
        }).filter(item => item.length === 2 && item[1] && item[1]?.type !== "undefined")
      ),
      required
    }
  }
  
  if (ts.isToken(type)) {
    return {
      type: ts.tokenToString(type.kind)
    }
  }
  if (ts.isLiteralTypeNode(type)) {
    if (ts.isStringLiteral(type.literal)) {
      return { 
        type: "string",
        enum: [ type.literal.text ]
      }
    }
    return {
      type: ts.tokenToString(type.literal.kind)
    }
  }
}

const getValue = (exp: ts.Expression | undefined) => {
  if (exp === undefined) return undefined
  if (ts.isNumericLiteral(exp)) return parseFloat(exp.text)
  if ("text" in exp) return exp.text as string

  return exp
}

const collectHttpErrors = (node: ts.Node, arr: any[] = []) => {

  if (ts.isThrowStatement(node) && ts.isNewExpression(node.expression) && 
  ts.isIdentifier(node.expression.expression) && node.expression.expression.escapedText === "HTTPError") {

    const code = getValue(node.expression.arguments?.[1]) ?? 400
    const nodeType = node.expression.arguments?.[0]
    const obj = nodeType && typeChecker.getTypeAtLocation(nodeType)
    const schema = obj && typeToSchema(typeChecker.typeToTypeNode(obj, undefined, ts.NodeBuilderFlags.NoTypeReduction | ts.NodeBuilderFlags.InTypeAlias)!)
    return
  }

  node.forEachChild(node => collectHttpErrors(node, arr))
}

const reccur = (node: ts.Node, sourceFile: ts.SourceFile, arr: any[] = []) => {
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) 
    && ts.isIdentifier(node.expression.expression) 
    && typeChecker.getTypeAtLocation(node.expression.expression).symbol?.escapedName === "FastifyInstance"
  ) {
    
    const method = node.expression.name.escapedText as string
    if (method !== "get" && method !== "post" && method !== "delete" && method !== "put") return
    
    const jsDoc = ts.getJSDocCommentsAndTags(node.parent)[0]
    const summary = jsDoc?.comment

    const tags: any = {}
    if (jsDoc && ts.isJSDoc(jsDoc) && jsDoc.tags) {
      for (let tag of jsDoc.tags) {
        if (typeof tag.comment !== "string") {
          if (!tag.comment) {
            tags[tag.tagName.escapedText as string] = true
          }
          continue
        }
        if (ts.isJSDocParameterTag(tag)) {
          if (!ts.isIdentifier(tag.name)) continue
          tags.params = Object.assign(tags.params ?? {}, { [ tag.name.escapedText as string ]: tag.comment.replace(tireReg, "") })
        } else if (tag.tagName.escapedText === "returns" && tag.comment){

          const start = tag.comment.split(" ", 1)[0]
          const code = parseInt(start)
          
          tags.returns = Object.assign(tags.returns ?? {}, { 
            [ isNaN(code)? 200: code ]: isNaN(code)? tag.comment: tag.comment.slice(start.length+1).replace(tireReg, "") 
          })
        } else {
          tags[tag.tagName.escapedText as string] = tag.comment
        }
      }
    }

    collectHttpErrors(node)
      
    const type = typeChecker.getTypeAtLocation(node.arguments[0])
    
    const path = type.isStringLiteral()? type.value: node.arguments[0].getText(sourceFile)    

    const funcType = typeChecker.getTypeAtLocation(node.arguments[node.arguments.length-1])
    const signature = typeChecker.getSignaturesOfType(funcType, ts.SignatureKind.Call)[0]
      
    const returnType = (typeChecker.getReturnTypeOfSignature(signature) as ts.TypeReference).typeArguments

    if (!returnType) {
      arr.push({
        method,
        path,
        summary,
        ...tags,
      })
      return
    }

    const _node = typeChecker.typeToTypeNode(returnType[0], undefined, ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.NoTypeReduction | ts.NodeBuilderFlags.InTypeAlias)!
    const returnSchema = typeToSchema(_node)

    arr.push({
      method,
      path,
      summary,
      ...tags,
      returnSchema,
      returnType: typeChecker.typeToString(returnType[0], undefined, ts.NodeBuilderFlags.NoTruncation | ts.TypeFormatFlags.NoTypeReduction | ts.TypeFormatFlags.InTypeAlias)
    })
  }
  
  ts.forEachChild(node, cbNode => reccur(cbNode, sourceFile, arr))
}

// readDir("src/backend/plugins", (file) => {
//   if (!file.endsWith(".d.ts")) return
//   import (url.pathToFileURL(file).toString())
// })

const swagger = {
  openapi: "3.1.0",
  info: {
    "title": PROJECT_TITLE,
    "description": PROJECT_DESCRIPTION,
  },
  paths: {

  } as any,
  tags: [] as { name: string, description?: string, order?: number, group?: string }[],
  "x-tagGroups": [] as { name: string, tags: string[] }[]
}

const addDescription = (schema: any, params: Record<string, string>) => {
  const _schema = JSON.parse(JSON.stringify(schema))
  for (let [param, text] of Object.entries(params)) {
    let obj = _schema
    let find = true
    for (let key of param.split(".")) {
      if (key === "[]") {
        obj = obj.items
      }

      if (!obj.properties || !(key in obj.properties)) {
        find = false
        break
      }
      obj = obj.properties[key]
    }

    if (find) {
      obj.description = text
    }
  }
  return _schema
}

const firstUpperCase = (str: string) => str.slice(0, 1).toUpperCase()+str.slice(1)
const addTag = (sourceFile: ts.SourceFile, defaultName: string) => {
  const symbol = typeChecker.getSymbolAtLocation(sourceFile)!.exports!.get("default" as any)!
  const tagName = symbol.getDocumentationComment(typeChecker)?.[0]?.text ?? firstUpperCase(defaultName)
  const tagProps = symbol.getJsDocTags(typeChecker)
  if (!tagName) return null

  const description = tagProps.find(item => item.name === "description")?.text?.[0].text

  const existIndex = swagger.tags.findIndex(item => item.name === tagName)
  if (existIndex >= 0) {
    if (!swagger.tags[existIndex].description && description) {
      swagger.tags.splice(existIndex, 1)
    } else {
      return tagName
    }
  }

  const order = tagProps.find(item => item.name === "order")?.text?.[0].text
  const group = tagProps.find(item => item.name === "group")?.text?.[0].text

  swagger.tags.push({
    name: tagName,
    description,
    group,
    order: order? parseInt(order): undefined
  })

  return tagName
}

const init = async () => {
  for (let file of program.getRootFileNames()) {
    if (!file.startsWith(rootDir)) continue

    const relativePath = file.slice(rootDir.length+1).split(/[\\/]/)
    const _url = [ prefix, ...relativePath.slice(0, -1) ].join("/")

    if (file.endsWith(".d.ts")) continue
    const sourceFile = program.getSourceFile(file)!
    
    const tagName = addTag(sourceFile, relativePath[relativePath.length-2] ?? "other")
    
    const paths: any = []
    reccur(sourceFile, sourceFile, paths)

    const module = await import(url.pathToFileURL(file).toString())

    if (typeof module.default !== "function") continue
    const app = fastify()

    const schemas = new Map<string, any>()
    app.addHook("onRoute", (req) => {
      schemas.set(`${req.method}:${req.path}`, req.schema)
    })

    await app.register(module)
    
    for (let item of paths) {
      const { returns, path, method, returnType, returnSchema, params, tags, ...otherProps } = item
      const _returns = returns || {}
      const positiveResponse = Object.keys(_returns).find(item => item < "400" && item >= "100")

      const schema = schemas.get(`${method.toUpperCase()}:${path}`)
      const fullPath = (_url+path).replace(/\/+$/g, "").replace(/:[a-zA-Z]+/g, "{$&}").replace(/\:/g, "")

      const _tags = tags?.split(" ") ?? []
      if (tagName) {
        _tags.unshift(tagName)
      }

      swagger.paths[fullPath] = Object.assign(swagger.paths[fullPath] ?? {}, {
        [ method ]: {
          ...otherProps,
          tags: _tags,
          responses: {
            [positiveResponse ?? "200"]: {
              description: (_returns)[positiveResponse ?? "200"],
              content: returnSchema? {
                "application/json": {
                  schema: returnSchema
                }
              }: undefined
            },
            ...Object.fromEntries(Object.entries(_returns).filter(item => item[0] !== positiveResponse).map(item => {
              return [ item[0], { 
                description: item[1]
              }]
            }))
          },
          requestBody: schema?.body? {
            "content": {
              [ schema.consumes?.[0] ?? "application/json"]: {
                "schema": addDescription(schema.body, params ?? {})
              }
            }
          }: undefined,
          parameters: [
            ...(schema?.params? Object.entries(schema.params.properties).map(item => ({
              name: item[0],
              schema: item[1],
              in: "path",
              description: (params ?? {})[item[0]],
              required: schema.params.required.includes(item[0])
            })): []),
            ...(schema?.querystring? Object.entries(schema.querystring.properties).map(item => ({
              name: item[0],
              schema: item[1],
              in: "query",
              description: (params ?? {})[item[0]],
              required: schema.querystring.required.includes(item[0])
            })): [])
          ]
        }
      }) 
    }
  }

  swagger.tags.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  for (let tag of swagger.tags) {
    const group = tag.group || "base"
    let xTagGroup = swagger["x-tagGroups"].find(item => item.name === group)
    if (!xTagGroup) {
      xTagGroup = { name: group, tags: [] }
      swagger["x-tagGroups"].push(xTagGroup)
    }
    xTagGroup.tags.push(tag.name)
  }

  fs.writeFileSync(path.join(process.cwd(), "./public/redoc/api.json"), JSON.stringify(swagger))

  console.info("File api.json has been writed")
}

init()