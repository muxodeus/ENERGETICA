<template>
  <div class="app-container">
    <!-- Header con información de usuario y botón de logout -->
    <header class="header">
      <h1>Dashboard Energética</h1>
      <div class="user-info">
        <span>{{ user.email }}</span>
        <button @click="logout">Logout</button>
      </div>
    </header>

    <!-- Contenedor principal: mapa -->
    <div class="content">
      <div class="map-container" ref="mapContainer"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ApexCharts from 'apexcharts'

// Datos de autenticación simulados.
const user = ref({
  email: 'jose@mail.com',
  role: 'admin_master' // o 'visualizer'
})

// Función de logout (simulada).
function logout() {
  console.log("Logout clicked – borrando credenciales...")
  // Aquí podrías limpiar el store de autenticación
  // y redirigir a la página de login.
}

// Datos de ejemplo para los medidores.
const meters = ref([
  {
    id: 1,
    name: 'Medidor 1 - Bomba de Agua',
    lat: 13.715,
    lng: -89.200,
    status: 'activo',
    historyData: [10, 15, 12, 20, 18]
  },
  {
    id: 2,
    name: 'Medidor 2 - Planta Solar',
    lat: 13.720,
    lng: -89.210,
    status: 'inactivo',
    historyData: [8, 12, 11, 14, 9]
  },
  {
    id: 3,
    name: 'Medidor 3 - Subestación',
    lat: 13.730,
    lng: -89.220,
    status: 'activo',
    historyData: [20, 22, 19, 23, 25]
  }
])

const mapContainer = ref(null)
let map = null
const charts = {} // Aquí guardaremos las instancias de ApexCharts

// Función para inicializar el gráfico usando ApexCharts en el popup de cada medidor.
function initChart(meter) {
  const containerId = `chart-${meter.id}`
  const chartEl = document.getElementById(containerId)
  if (!chartEl) {
    console.error(`Contenedor del gráfico ${containerId} no encontrado para el medidor ${meter.id}`)
    return
  }
  
  // Definición de las opciones para el gráfico.
  const options = {
    chart: {
      type: 'line',
      height: 50,
      sparkline: { enabled: true }
    },
    series: [{
      data: meter.historyData || [0, 0, 0, 0, 0]
    }],
    stroke: { curve: 'smooth' },
    tooltip: { enabled: false },
    grid: { show: false },
    colors: ["#00E396"]
  }
  
  console.log(`Opciones de ApexCharts para el medidor ${meter.id}:`, options)
  
  // Destruye instancia previa del gráfico (si existe)
  if (charts[meter.id]) {
    charts[meter.id].destroy()
  }
  
  try {
    charts[meter.id] = new ApexCharts(chartEl, options)
    charts[meter.id].render()
  } catch (error) {
    console.error(`Error al renderizar ApexCharts para el medidor ${meter.id}:`, error)
  }
}

// Función para simular la actualizacíon de datos y refrescar el gráfico.
function updateChart(meter) {
  // Simula un nuevo valor aleatorio.
  const newVal = Math.floor(Math.random() * 100)
  meter.historyData.push(newVal)
  // Limita el historial a 10 datos.
  if (meter.historyData.length > 10) {
    meter.historyData.shift()
  }
  // Si el gráfico existe, actualización de la serie.
  if (charts[meter.id]) {
    charts[meter.id].updateSeries([{ data: meter.historyData }])
  }
}

onMounted(() => {
  // Inicializa el mapa centrado en una zona de El Salvador.
  map = L.map(mapContainer.value).setView([13.720, -89.210], 10)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  
  // Agrega un marcador para cada medidor y configura su popup.
  meters.value.forEach((meter) => {
    const popupContent = `
      <div>
        <strong>${meter.name}</strong><br/>
        Estado: ${meter.status}<br/>
        <div id="chart-${meter.id}" style="width:100%; height:50px; margin-top:5px;"></div>
      </div>
    `
    const marker = L.marker([meter.lat, meter.lng]).addTo(map)
    marker.bindPopup(popupContent)
    
    // Al abrir el popup, espera a que se renderice el DOM y luego inicializa el gráfico.
    marker.on('popupopen', () => {
      nextTick(() => {
        initChart(meter)
      })
    })
    
    // Inicia una simulación de actualización de datos y refresca el gráfico cada 5 segundos.
    setInterval(() => {
      updateChart(meter)
    }, 5000)
  })
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: #fff;
  padding: 0.8rem 1rem;
}
.user-info span {
  margin-right: 1rem;
}
.content {
  flex: 1;
}
.map-container {
  width: 100%;
  height: 100%;
}
</style>
