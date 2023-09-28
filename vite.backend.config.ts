import { defineConfig } from "vite";
import path from 'path'
import pkg from './package.json';

const nodeExternal = [
  "assert",
  "async_hooks",
  "buffer",
  "child_process",
  "constants",
  "crypto",
  "diagnostics_channel",
  "dns",
  "electron",
  "events",
  "fs",
  "fs/promises",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "process",
  "querystring",
  "stream",
  "string_decoder",
  "tls",
  "tty",
  "url",
  "util",
  "worker_threads",
  "zlib",
  ".prisma/client/index"
]

export default defineConfig(({ mode }) => ({
  define: {
    "process.env.WS_NO_BUFFER_UTIL": "true",
    "process.env.WS_NO_UTF_8_VALIDATE": "true"
  },
  resolve: {
    mainFields: [ "main", "module", "node" ],
    browserField: false,
    alias: {
      "@lukeed/csprng": "./node_modules/@lukeed/csprng/node/index.mjs"            // It is not good, but otherwise Vite import browser file here
    }
  },
  root: "src/backend",
  build: {
    target: "node18",
    minify: false,
    sourcemap: true,
    lib: {
      entry: {
        "main": "index.ts",
      },
      formats: [ "cjs" ],
      name: "main"
    },
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      external: [
        ...Object.keys(pkg.dependencies),
        /^node:/,
        ...nodeExternal
      ],
    },
    outDir: path.join(__dirname, "dist/backend"),
    emptyOutDir: true
  }
}))