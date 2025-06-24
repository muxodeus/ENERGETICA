// main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import VueApexCharts from 'vue3-apexcharts'
import '@/assets/styles/main.css'
import 'leaflet/dist/leaflet.css'


const app = createApp(App)
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.mount('#app');
// Se registra globalmente el componente ApexChart
app.component('ApexChart', VueApexCharts)

