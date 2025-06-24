<!-- src/views/MeterDetail.vue -->
<template>
  <div class="meter-detail">
    <h2>Detalle del Medidor - {{ meterData?.name }}</h2>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="loading">
      Cargando datos...
    </div>
    
    <div v-else class="details">
      <p><strong>Estado:</strong> {{ meterData.status }}</p>
      <p><strong>Ubicación:</strong> {{ meterData.location }}</p>
      
      <!-- ApexCharts Chart -->
      <div class="chart-container">
        <apexchart
          type="line"
          height="350"
          :options="chartOptions"
          :series="chartSeries"
        ></apexchart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ApexChart from 'vue3-apexcharts'

// NOTE: Ensure you have installed vue3-apexcharts and apexcharts:
// npm install apexcharts vue3-apexcharts

// Get the meter id from the route param
const route = useRoute()
const meterId = route.params.id

// Local state for meter details, loading and errors
const meterData = ref(null)
const loading = ref(true)
const error = ref(null)

// For ApexCharts – series data and options
const chartSeries = ref([])
const chartOptions = ref({
  chart: {
    id: 'energy-chart',
    toolbar: { show: true }
  },
  xaxis: {
    type: 'datetime',
    title: { text: 'Fecha/Hora' }
  },
  yaxis: {
    title: { text: 'Consumo (kWh)' }
  },
  stroke: {
    curve: 'smooth'
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy HH:mm'
    }
  }
})

// Function to fetch meter details
const fetchMeterData = async () => {
  try {
    const response = await axios.get(`/api/meters/${meterId}`)
    meterData.value = response.data
  } catch (err) {
    error.value = 'Error obteniendo los detalles del medidor.'
    console.error(err)
  }
}

// Function to fetch historical chart data for the meter
const fetchMeterChartData = async () => {
  try {
    const response = await axios.get(`/api/meters/${meterId}/chart-data`)
    const rawData = response.data
    // Convert response into series data: [timestamp, consumption]
    const seriesData = rawData.map(item => [item.timestamp, item.consumption])
    chartSeries.value = [{
      name: 'Consumo Energético',
      data: seriesData
    }]
  } catch (err) {
    error.value = 'Error obteniendo los datos del gráfico.'
    console.error(err)
  }
}

onMounted(async () => {
  await fetchMeterData()
  await fetchMeterChartData()
  loading.value = false
})
</script>

<style scoped>
.meter-detail {
  padding: 20px;
}
.error {
  color: red;
  font-weight: bold;
}
.details p {
  margin: 8px 0;
}
.chart-container {
  margin-top: 24px;
}
</style>
