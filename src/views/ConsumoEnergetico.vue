<template>
  <div class="consumo-dashboard">
    <!-- Encabezado global reutilizable: se incluye el DashboardHeader -->
    <DashboardHeader 
      title="Análisis de Consumo" 
      subtitle="Desglose por sectores y horarios clave" 
    />
    
    <div class="dashboard-consumo-avanzado">
      <header class="header">
        <h2>Dashboard de Consumo de Energía Avanzado</h2>
        <div class="controls">
          <label>Desde:</label>
          <input type="date" v-model="desde" />
          <label>Hasta:</label>
          <input type="date" v-model="hasta" />
          <button @click="analizar">Analizar</button>
        </div>
      </header>
      
      <!-- Panel de KPIs Avanzados -->
      <section class="kpi-panel">
        <div class="card">
          <h3>Total de Consumo</h3>
          <p class="value">{{ totalConsumo }} kWh</p>
        </div>
        <div class="card">
          <h3>Consumo Promedio</h3>
          <p class="value">{{ promedioConsumo }} kWh</p>
        </div>
        <div class="card">
          <h3>Consumo Máximo</h3>
          <p class="value">{{ maxConsumo }} kW</p>
        </div>
        <div class="card">
          <h3>Desviación Estándar</h3>
          <p class="value">{{ desviacionConsumo }} kWh</p>
        </div>
        <div class="card">
          <h3>Coeficiente de Variación</h3>
          <p class="value">{{ coefVariacion }}%</p>
        </div>
        <div class="card">
          <h3>Predicción Siguiente Día</h3>
          <p class="value">{{ prediccion }} kWh</p>
        </div>
      </section>
      
      <!-- Gráficos: organizados en 2 filas y 3 columnas -->
      <section class="charts-grid">
        <div class="chart-item">
          <h3>Tendencia con EMA</h3>
          <ApexChart type="line" height="300" :options="trendChartOptions" :series="trendChartSeries" />
        </div>
        
        <div class="chart-item">
          <h3>Histograma de Consumo</h3>
          <ApexChart type="bar" height="300" :options="histChartOptions" :series="histChartSeries" />
        </div>
        
        <div class="chart-item">
          <h3>Forecast 24h</h3>
          <ApexChart type="area" height="300" :options="forecastChartOptions" :series="forecastChartSeries" />
        </div>
        
        <div class="chart-item">
          <h3>Consumo Diario (kWh)</h3>
          <ApexChart type="bar" height="300" :options="dailyBarOptions" :series="dailyBarSeries" />
        </div>
        
        <div class="chart-item">
          <h3>Box Plot Diario</h3>
          <ApexChart type="boxPlot" height="300" :options="boxPlotOptions" :series="boxPlotSeries" />
        </div>
        
        <div class="chart-item">
          <h3>Scatter de Outliers</h3>
          <ApexChart type="scatter" height="300" :options="scatterChartOptions" :series="scatterChartSeries" />
        </div>
      </section>
    </div>
    
    <!-- Footer global reutilizable -->
    <FooterGlobal />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import ApexChart from 'vue3-apexcharts'
import DashboardHeader from '@/components/DashboardHeader.vue'
import FooterGlobal from '@/components/FooterGlobal.vue'

// Controles de fecha
const desde = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))

// KPIs
const totalConsumo = ref(0)
const promedioConsumo = ref(0)
const maxConsumo = ref(0)
const desviacionConsumo = ref(0)
const coefVariacion = ref(0)
const prediccion = ref(0)

// Gráfico: Tendencia con EMA
const trendChartSeries = ref([])
const trendChartOptions = ref({
  chart: { id: 'trend-chart' },
  xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
  title: { text: 'Tendencia de Consumo (EMA)' }
})

// Gráfico: Histograma
const histChartSeries = ref([])
const histChartOptions = ref({
  chart: { id: 'hist-chart' },
  xaxis: { categories: [] },
  title: { text: 'Histograma del Consumo' }
})

// Gráfico: Forecast para 24h
const forecastChartSeries = ref([])
const forecastChartOptions = ref({
  chart: { id: 'forecast-chart' },
  xaxis: { type: 'datetime', labels: { datetimeUTC: false } },
  title: { text: 'Forecast para Próximas 24 Horas' }
})

// Gráfico: Consumo Diario (barra)
const dailyBarSeries = ref([])
const dailyBarOptions = ref({
  chart: { id: 'daily-bar-chart', type: 'bar' },
  xaxis: { categories: [], title: { text: 'Día' } },
  title: { text: 'Consumo Diario (kWh)' }
})

// Gráfico: Box Plot Diario
const boxPlotSeries = ref([])
const boxPlotOptions = ref({
  chart: { id: 'boxplot-chart', type: 'boxPlot' },
  title: { text: 'Box Plot Diario' }
})

// Gráfico: Scatter de Outliers
const scatterChartSeries = ref([])
const scatterChartOptions = ref({
  chart: { id: 'scatter-chart' },
  xaxis: { title: { text: 'Tiempo' } },
  yaxis: { title: { text: 'Consumo (kWh)' } },
  title: { text: 'Scatter de Outliers' }
})

// Simulación de datos de consumo para 7 días (24h cada día)
const consumptionData = []
const simulationStart = dayjs(desde.value)
const numDays = dayjs(hasta.value).diff(simulationStart, 'day') + 1
for (let d = 0; d < numDays; d++) {
  for (let h = 0; h < 24; h++) {
    const timestamp = simulationStart.add(d, 'day').hour(h).minute(0).second(0).valueOf()
    // Simulación: consumo base de 50 kWh con variación aleatoria
    const value = +(50 + (Math.random() * 30 - 15)).toFixed(1)
    consumptionData.push({ timestamp, value })
  }
}

function analizar() {
  // Calcular KPIs
  const total = consumptionData.reduce((sum, d) => sum + d.value, 0)
  totalConsumo.value = total.toFixed(1)
  const prom = total / consumptionData.length
  promedioConsumo.value = prom.toFixed(1)
  maxConsumo.value = Math.max(...consumptionData.map(d => d.value)).toFixed(1)
  const variance = consumptionData.reduce((acc, d) => acc + Math.pow(d.value - prom, 2), 0) / consumptionData.length
  desviacionConsumo.value = Math.sqrt(variance).toFixed(1)
  coefVariacion.value = ((desviacionConsumo.value / promedioConsumo.value) * 100).toFixed(1)
  prediccion.value = (prom * 1.1).toFixed(1)
  
  // Tendencia con EMA
  const trendData = consumptionData.map(d => ({ x: d.timestamp, y: d.value }))
  const emaData = []
  const period = 12
  const alpha = 2 / (period + 1)
  let emaPrev = trendData[0].y
  emaData.push({ x: trendData[0].x, y: emaPrev })
  for (let i = 1; i < trendData.length; i++) {
    const emaCurrent = alpha * trendData[i].y + (1 - alpha) * emaPrev
    emaData.push({ x: trendData[i].x, y: +emaCurrent.toFixed(1) })
    emaPrev = emaCurrent
  }
  trendChartSeries.value = [
    { name: 'Consumo Real', data: trendData },
    { name: 'EMA', data: emaData }
  ]
  
  // Histograma: Agrupar consumos en buckets de 5 kWh
  const buckets = {}
  consumptionData.forEach(d => {
    const bucket = Math.floor(d.value / 5) * 5
    buckets[bucket] = (buckets[bucket] || 0) + 1
  })
  const bucketCategories = Object.keys(buckets).sort((a, b) => a - b)
  const bucketData = bucketCategories.map(bucket => buckets[bucket])
  histChartOptions.value.xaxis.categories = bucketCategories.map(b => `${b}-${+b+5}`)
  histChartSeries.value = [{ name: 'Frecuencia', data: bucketData }]
  
  // Forecast: para las próximas 24 horas, usando el valor predicho
  const lastTimestamp = consumptionData[consumptionData.length - 1].timestamp
  const forecastData = []
  for (let h = 1; h <= 24; h++) {
    forecastData.push({ x: lastTimestamp + h * 3600000, y: +prediccion.value })
  }
  forecastChartSeries.value = [{ name: 'Forecast', data: forecastData }]
  
  // Consumo Diario: Sumar el consumo por cada día
  const dailyConsumption = []
  for (let d = 0; d < numDays; d++) {
    const dayTotal = consumptionData.filter(item =>
      dayjs(item.timestamp).isSame(simulationStart.add(d, 'day'), 'day')
    ).reduce((acc, item) => acc + item.value, 0)
    dailyConsumption.push(+dayTotal.toFixed(1))
  }
  dailyBarSeries.value = [{ name: 'Consumo Diario', data: dailyConsumption }]
  dailyBarOptions.value.xaxis.categories = Array.from({ length: numDays }, (_, i) =>
    simulationStart.add(i, 'day').format('YYYY-MM-DD')
  )
  
  // Box Plot Diario: Calcular [min, Q1, mediana, Q3, max] para todos los datos
  const values = consumptionData.map(d => d.value)
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const median = sorted[Math.floor(sorted.length * 0.5)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const minVal = Math.max(0, q1 - 1.5 * iqr)
  const maxVal = q3 + 1.5 * iqr
  boxPlotSeries.value = [{ data: [{ x: 'Consumo', y: [minVal, q1, median, q3, maxVal] }] }]
  
  // Scatter (Outliers): más de 2 desviaciones estándar
  const scatterData = consumptionData.filter(d =>
    d.value > (prom + 2 * desviacionConsumo.value) || d.value < (prom - 2 * desviacionConsumo.value)
  ).map(d => ({ x: d.timestamp, y: d.value }))
  scatterChartSeries.value = [{ name: 'Outliers', data: scatterData }]
}

onMounted(() => {
  analizar()
})
</script>

<style scoped>
/* Contenedor principal del dashboard */
.consumo-dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fc;
  box-sizing: border-box;
  padding-bottom: 3rem; /* Reserva espacio para el footer */
}

/* Encabezado global */
.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}
.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.dashboard-header p {
  font-size: 1.2rem;
  color: #555;
}

/* Dashboard de consumo avanzado */
.dashboard-consumo-avanzado {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header interno del dashboard de consumo */
.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.header h2 {
  font-size: 2rem;
  margin: 0;
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
.controls input {
  padding: 0.5rem;
  font-size: 1rem;
}

/* Panel de KPIs */
.kpi-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
.card {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
  min-width: 150px;
  text-align: center;
  transition: transform 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
}
.card .value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

/* Gráficos: distribución en 2 filas y 3 columnas */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.chart-item {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
.chart-item:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  transform: translateY(-6px);
}
.chart-item h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #2c3e50;
}

/* Footer universal */
.footer-global {
  margin-top: auto;
  padding: 1rem;
  text-align: center;
  background: #2c3e50;
  color: #ecf0f1;
  font-size: 1rem;
}
</style>
