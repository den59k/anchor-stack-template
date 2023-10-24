import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteSvgPlugin from './scripts/viteSvgPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/frontend",
  plugins: [vue(), splitVendorChunkPlugin(), viteSvgPlugin()],
  server: {
    port: 7000,
    proxy: {
      "^/api/(?!.*[.]ts).*$": "http://localhost:3001",
      "/images": "http://localhost:3001",
      "/s3": "http://localhost:3001",
      "/ar-assets": "http://localhost:3001",
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
