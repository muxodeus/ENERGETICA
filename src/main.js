import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@/assets/styles/main.css'
import 'leaflet/dist/leaflet.css'
import { useAuthStore }   from '@/stores/authStore'
import VueApexCharts      from 'vue3-apexcharts'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Hidrata credenciales en cada recarga
const authStore = useAuthStore()
if (authStore.hydrate) {
  authStore.hydrate()
}
// registra globalmente el componente <ApexChart>
app.use(VueApexCharts)

app.mount('#app')
