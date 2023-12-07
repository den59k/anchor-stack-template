import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteSvgPlugin from './scripts/viteSvgPlugin'

const env = loadEnv("mock", process.cwd(), "");
const server = env.PROXY || "http://127.0.0.1:3001";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/frontend",
  plugins: [vue(), splitVendorChunkPlugin(), viteSvgPlugin()],
  server: {
    port: 7000,
    proxy: {
      "^/api/(?!.*[.]ts).*$": server,
      "/images": server,
      "/s3": server,
      "/ar-assets": server,
    }
  },
  build: {
    outDir: path.join(__dirname, "./dist/frontend"),
    emptyOutDir: true
  },
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false
  },
})
