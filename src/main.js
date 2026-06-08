import './assets/style.css'
import { createPinia } from 'pinia'
import router from './router'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')
