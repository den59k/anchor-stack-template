import fs from 'fs'
import path from 'path'

const reg = /^V[A-Z]/

const getName = (item) => {
  return item.split(".")[0]
}

const files = fs.readdirSync(path.join(process.cwd(), "src/frontend/components"))

const components = files.filter(item => reg.test(item))

const iconFiles = fs.readdirSync(path.join(process.cwd(), "src/frontend/assets/icons"))

const file = `
import { Plugin } from "vue"
${components.map(item => `import ${getName(item)} from "./components/${item}"`).join("\n")}

export const registerComponents: Plugin = {
  install: (app) => {
    ${components.map(item => `app.component("${getName(item)}", ${getName(item)})`).join("\n    ")}
  }
}

${iconFiles.length > 0? (
  `export type IconType = ${iconFiles.map(item => `"${getName(item)}"`).join(" | ")}`
): ""}
`.trimStart()

const dts = `

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ${components.map(item => `${getName(item)}: typeof import("./components/${item}")["default"]`).join("\n    ")}
  }
}
`

fs.writeFileSync(path.join(process.cwd(), "src/frontend/registerComponents.ts"), file + dts)

// export type IconType = ""