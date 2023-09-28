import { createApp } from 'vue'
import './styles/global.sass'
import './utils/setup'
import App from './components/App.vue'
import { createPinia } from 'pinia'
import { router } from './router'
import { registerComponents } from './registerComponents'

createApp(App)
  .use(router)
  .use(createPinia())
  .use(registerComponents)
  .mount('#app')
