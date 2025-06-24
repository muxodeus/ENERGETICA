<template>
  <div class="dashboard-patrones">
    <header class="header">
      <h2>Dashboard Históricos de Análisis de Patrones de Parámetros</h2>
      <div class="controls">
        <label>Parámetro:</label>
        <select v-model="parametro">
          <option value="energia">Energía (kWh)</option>
          <option value="potencia">Potencia (kW)</option>
          <option value="voltaje">Voltaje (V)</option>
          <option value="corriente">Corriente (A)</option>
        </select>
        <label>Desde:</label>
        <input type="date" v-model="desde" />
        <label>Hasta:</label>
        <input type="date" v-model="hasta" />
        <button @click="analizar">Analizar</button>
      </div>
    </header>

    <!-- Tendencia Histórica -->
    <section class="section-chart">
      <h3>Tendencia Histórica del {{ parametroLabel }}</h3>
      <ApexChart type="line" height="300" :options="trendChartOptions" :series="trendChartSeries" />
    </section>

    <!-- Descomposición Temporal -->
    <section class="section-chart">
      <h3>Descomposición de Series Temporales</h3>
      <ApexChart type="line" height="300" :options="decompositionOptions" :series="decompositionSeries" />
    </section>

    <!-- Análisis de Correlación -->
    <section class="section-chart">
      <h3>Análisis de Correlación de Parámetros</h3>
      <ApexChart type="heatmap" height="300" :options="correlationOptions" :series="correlationSeries" />
    </section>

    <!-- Predicción AI Avanzada -->
    <section class="section-chart">
      <h3>Predicción AI Avanzada del {{ parametroLabel }}</h3>
      <ApexChart type="area" height="300" :options="forecastOptions" :series="forecastSeries" />
    </section>

    <!-- Insights de AI -->
    <section class="insights">
      <h3>Insights Generados por AI</h3>
      <table>
        <thead>
          <tr>
            <th>Insight</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(insight, index) in insights" :key="index">
            <td>{{ insight.titulo }}</td>
            <td>{{ insight.descripcion }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import ApexChart from 'vue3-apexcharts'

// Controles
const parametro = ref('energia')
const desde = ref(dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))

const parametroLabel = computed(() => {
  switch(parametro.value) {
    case 'energia': return 'Energía'
    case 'potencia': return 'Potencia'
    case 'voltaje': return 'Voltaje'
    case 'corriente': return 'Corriente'
    default: return parametro.value
  }
})

// Simulación de datos históricos
let historicalData = []
function generarDatos() {
  const start = dayjs(desde.value)
  const end = dayjs(hasta.value)
  const numDays = end.diff(start, 'day') + 1
  historicalData = []
  for (let d = 0; d < numDays; d++) {
    // Base de simulación según parámetro
    const base = (parametro.value === 'energia') ? 100 : 
                 (parametro.value === 'potencia') ? 50 : 
                 (parametro.value === 'voltaje') ? 220 :
                 (parametro.value === 'corriente') ? 30 : 0
    const fluct = Math.random() * base * 0.2 - base * 0.1
    const value = +(base + fluct).toFixed(1)
    const timestamp = start.add(d, 'day').valueOf()
    historicalData.push({ timestamp, value })
  }
}
generarDatos()

// Tendencia Histórica
const trendChartSeries = ref([{
  name: parametroLabel.value,
  data: historicalData.map(item => ({ x: item.timestamp, y: item.value }))
}])
const trendChartOptions = ref({
  chart: { id: 'historical-trend' },
  xaxis: { type: 'datetime' },
  title: { text: `Tendencia Histórica de ${parametroLabel.value}` }
})

// Descomposición de Series Temporales (simulación)
const decompositionSeries = ref([
  {
    name: 'Trend',
    data: historicalData.map(item => ({ x: item.timestamp, y: +((item.value * 0.9)).toFixed(1) }))
  },
  {
    name: 'Seasonal',
    data: historicalData.map((item, index) => ({ x: item.timestamp, y: +(10 * Math.sin(index)).toFixed(1) }))
  },
  {
    name: 'Residual',
    data: historicalData.map((item, index) => ({ x: item.timestamp, y: +(item.value - item.value * 0.9 - 10 * Math.sin(index)).toFixed(1) }))
  }
])
const decompositionOptions = ref({
  chart: { id: 'decomposition-chart' },
  xaxis: { type: 'datetime' },
  title: { text: 'Descomposición Temporal' }
})

// Análisis de Correlación: Simulación de matriz de correlación entre 4 parámetros
const correlationData = [
  [1, 0.8, 0.5, 0.3],
  [0.8, 1, 0.4, 0.35],
  [0.5, 0.4, 1, 0.6],
  [0.3, 0.35, 0.6, 1]
]
const parameters = ['Energía', 'Potencia', 'Voltaje', 'Corriente']
const correlationSeries = ref(parameters.map((param, i) => ({
  name: param,
  data: correlationData[i].map((val, j) => ({ x: parameters[j], y: val }))
})))
const correlationOptions = ref({
  chart: { id: 'correlation-heatmap' },
  title: { text: 'Matriz de Correlación' },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          { from: 0, to: 0.4, color: '#FF3333' },
          { from: 0.4, to: 0.7, color: '#FFCC33' },
          { from: 0.7, to: 1, color: '#00E396' }
        ]
      }
    }
  },
  dataLabels: { enabled: true }
})

// Predicción AI Avanzada: Forecast para los próximos 7 días
const forecastSeries = ref([{
  name: 'Forecast',
  data: []
}])
const forecastOptions = ref({
  chart: { id: 'forecast-chart' },
  xaxis: { type: 'datetime' },
  title: { text: `Predicción Avanzada de ${parametroLabel.value}` }
})
function generarForecast() {
  const lastTimestamp = historicalData[historicalData.length - 1].timestamp
  const forecastData = []
  for (let i = 1; i <= 7; i++) {
    const forecastValue = +(historicalData.reduce((sum, item) => sum + item.value, 0) / historicalData.length * (1 + Math.random() * 0.1 - 0.05)).toFixed(1)
    forecastData.push({ x: dayjs(lastTimestamp).add(i, 'day').valueOf(), y: forecastValue })
  }
  forecastSeries.value = [{ name: 'Forecast', data: forecastData }]
}
generarForecast()

// Insights generados por AI
const insights = ref([
  {
    titulo: 'Tendencia Creciente',
    descripcion: `El ${parametroLabel.value} muestra un crecimiento sostenido durante el periodo analizado.`
  },
  {
    titulo: 'Patrón Estacional',
    descripcion: 'Se observa un patrón estacional con fl uctuaciones regulares cada semana.'
  },
  {
    titulo: 'Anomalía Detectada',
    descripcion: `Un pico atípico se registró el día ${dayjs(historicalData[Math.floor(historicalData.length/2)].timestamp).format('YYYY-MM-DD')}.`
  },
  {
    titulo: 'Buena Correlación',
    descripcion: `El ${parametroLabel.value} presenta alta correlación con Potencia (coeficiente 0.8).`
  }
])

// Función principal analizar
function analizar() {
  generarDatos()
  // Actualizar tendencia histórica
  trendChartSeries.value = [{
    name: parametroLabel.value,
    data: historicalData.map(item => ({ x: item.timestamp, y: item.value }))
  }]
  trendChartOptions.value.title.text = `Tendencia Histórica de ${parametroLabel.value}`
  
  // Actualizar descomposición
  decompositionSeries.value = [
    {
      name: 'Trend',
      data: historicalData.map(item => ({ x: item.timestamp, y: +((item.value * 0.9)).toFixed(1) }))
    },
    {
      name: 'Seasonal',
      data: historicalData.map((item, index) => ({ x: item.timestamp, y: +(10 * Math.sin(index)).toFixed(1) }))
    },
    {
      name: 'Residual',
      data: historicalData.map((item, index) => ({ x: item.timestamp, y: +(item.value - item.value * 0.9 - 10 * Math.sin(index)).toFixed(1) }))
    }
  ]
  
  // Actualizar forecast
  generarForecast()
  
  // Actualizar insights (simulados)
  insights.value = [
    {
      titulo: 'Tendencia Creciente',
      descripcion: `El ${parametroLabel.value} muestra un crecimiento sostenido durante el periodo.`
    },
    {
      titulo: 'Patrón Estacional',
      descripcion: 'Se observa un patrón estacional con fl uctuaciones regulares cada semana.'
    },
    {
      titulo: 'Anomalía Detectada',
      descripcion: `Pico atípico registrado el día ${dayjs(historicalData[Math.floor(historicalData.length/2)].timestamp).format('YYYY-MM-DD')}.`
    },
    {
      titulo: 'Buena Correlación',
      descripcion: `${parametroLabel.value} presenta alta correlación con Potencia (coeficiente 0.8).`
    }
  ]
}
</script>

<style scoped>
.dashboard-patrones {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.controls label {
  font-weight: bold;
}

.section-chart {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.insights {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.insights table {
  width: 100%;
  border-collapse: collapse;
}

.insights th,
.insights td {
  padding: 0.5rem;
  border: 1px solid #ccc;
  text-align: left;
}
</style>
