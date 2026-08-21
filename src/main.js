import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { authReady } from './stores/auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

async function bootstrap() {
  await authReady
  createApp(App).use(router).mount('#app')
}

bootstrap()
