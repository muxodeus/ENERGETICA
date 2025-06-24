<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ApexCharts from 'apexcharts'

const props = defineProps({
  meters: {
    type: Array,
    required: true
  },
  role: {
    type: String,
    default: 'visualizer'
  }
})

const mapContainer = ref(null)
let map = null
const charts = {} // Para guardar las instancias de ApexCharts

// Función para inicializar el mini gráfico para un medidor en su popup.
function initMiniChart(meter) {
  const chartEl = document.getElementById(`chart-${meter.id}`)
  if (!chartEl) {
    console.error(`Contenedor del gráfico no encontrado para el medidor ${meter.id}`)
    return
  }
  
  // Define las opciones para ApexCharts, asegurándote de incluir la propiedad "chart"
  const options = {
    chart: {
      type: 'line',
      height: 50,
      sparkline: { enabled: true }
    },
    stroke: { curve: 'smooth' },
    series: [{
      data: Array.isArray(meter.historyData) && meter.historyData.length 
              ? meter.historyData 
              : [10, 15, 12, 18, 16]  // Datos de respaldo
    }],
    tooltip: { enabled: false },
    grid: { show: false },
    colors: ['#00E396']
  }
  
  console.log(`Opciones de ApexCharts para el medidor ${meter.id}:`, options)
  
  // Destruye una instancia previa si existe
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

// Función simulada para actualizar los datos (historyData) del medidor cada 5 segundos.
function updateMeterData(meter) {
  if (!meter.historyData) {
    meter.historyData = [10, 15, 12, 18, 16]
  }
  // Simula la generación de un nuevo valor aleatorio
  const newVal = Math.round(Math.random() * 100)
  meter.historyData.push(newVal)
  // Limita el historial a 10 datos
  if (meter.historyData.length > 10) {
    meter.historyData.shift()
  }
  // Actualiza el gráfico si ya está creado
  if (charts[meter.id]) {
    charts[meter.id].updateSeries([{ data: meter.historyData }])
  }
}

onMounted(() => {
  // Inicializa el mapa centrado en El Salvador.
  map = L.map(mapContainer.value).setView([13.71, -89.19], 7)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)
  
  // Para cada medidor, crear un marcador y vincular un popup que incluya el contenedor para el mini gráfico.
  props.meters.forEach((meter) => {
    // Prepara el contenido del popup: nombre, estado, botón de edición (para admin/admin_master)
    // Y un DIV para el mini gráfico, identificado de forma única.
    const popupContent = `
      <strong>${meter.name}</strong><br/>
      Estado: ${meter.status}<br/>
      ${props.role === 'visualizador' || props.role === 'admin_master' ? '<button>Editar</button>' : ''}
      <div id="chart-${meter.id}" style="width:100%; height:50px; margin-top:5px;"></div>
    `
    
    // Crea un marcador (circleMarker) para el medidor.
    const marker = L.circleMarker([meter.lat, meter.lng], {
      color: meter.status === 'activo' ? '#3bb2d0' : '#d9534f'
    }).addTo(map)
    
    marker.bindPopup(popupContent)
    
    // Cuando el popup se abre, inicializa (o re-inicializa) el mini gráfico.
    marker.on('popupopen', () => {
      nextTick(() => {
        initMiniChart(meter)
      })
    })
    
    // Inicia una simulación para actualizar el gráfico cada 5 segundos.
    setInterval(() => {
      updateMeterData(meter)
    }, 5000)
  })
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 60px);
}
</style>
