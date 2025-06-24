<template>
  <div class="dashboard-anomalias">
    <header class="header">
      <h2>Dashboard de Anomalías</h2>
      <div class="controls">
        <label>Parámetro:</label>
        <select v-model="parametro">
          <option value="energia">Energía (kWh)</option>
          <option value="potencia">Potencia (kW)</option>
          <option value="voltaje">Voltaje (V)</option>
        </select>
        <div class="fecha-control">
          <label>Desde:</label>
          <input type="date" v-model="desde" />
          <label>Hasta:</label>
          <input type="date" v-model="hasta" />
        </div>
        <div class="umbrales">
          <label>Umbral Inferior:</label>
          <input type="number" v-model="umbralInferior" placeholder="Valor inferior" />
          <label>Umbral Superior:</label>
          <input type="number" v-model="umbralSuperior" placeholder="Valor superior" />
        </div>
        <button @click="analizar">Analizar</button>
      </div>
    </header>

    <section class="metrics">
      <div class="card">
        <h3>Total de Anomalías</h3>
        <p class="value">{{ totalAnomalias }}</p>
      </div>
      <div class="card">
        <h3>Desviación Promedio</h3>
        <p class="value">{{ desviacionPromedio }}%</p>
      </div>
      <div class="card">
        <h3>Máxima Desviación</h3>
        <p class="value">{{ maximaDesviacion }}%</p>
      </div>
      <div class="card">
        <h3>Duración Promedio</h3>
        <p class="value">{{ duracionPromedio }} min</p>
      </div>
    </section>

    <section class="trend-chart">
      <h3>Tendencia del Parámetro con Anomalías</h3>
      <ApexChart type="line" height="300" :options="chartOptions" :series="chartSeries" />
    </section>

    <section class="incidents-table">
      <h3>Tabla de Incidentes</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Valor Medido</th>
            <th>Umbral</th>
            <th>Desviación (%)</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(incidente, index) in incidentes" :key="index">
            <td>{{ incidente.fecha }}</td>
            <td>{{ incidente.valor }}</td>
            <td>{{ incidente.umbral }}</td>
            <td>{{ incidente.desviacion }}%</td>
            <td>{{ incidente.tipo }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="heatmap-chart">
      <h3>Distribución Horaria de Anomalías</h3>
      <ApexChart type="heatmap" height="300" :options="heatmapOptions" :series="heatmapSeries" />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
// Asegúrate de tener registrado ApexChart (por ejemplo, desde vue3-apexcharts)
import ApexChart from 'vue3-apexcharts'

// Variables de control
const parametro = ref('energia')
const desde = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))
const umbralInferior = ref(30)  // valor personalizable
const umbralSuperior = ref(70)  // valor personalizable

// Métricas
const totalAnomalias = ref(0)
const desviacionPromedio = ref(0)
const maximaDesviacion = ref(0)
const duracionPromedio = ref(0)

// Gráfico de tendencia
const chartSeries = ref([])
const chartOptions = ref({
  chart: { id: 'trend-anomalias' },
  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false }
  },
  markers: {
    size: 6,
    strokeWidth: 2,
    strokeColors: '#fff'
  },
  title: { text: 'Tendencia del Parámetro con Anomalías' }
})

// Tabla de incidentes
const incidentes = ref([])

// Heatmap de anomalías por hora
const heatmapSeries = ref([])
const heatmapOptions = ref({
  chart: { id: 'heatmap-anomalias' },
  plotOptions: { heatmap: { shadeIntensity: 0.5, radius: 4 } },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'category',
    categories: Array.from({ length: 24 }, (_, i) => `${i}h`)
  },
  title: { text: 'Distribución Horaria de Anomalías' }
})

function analizar() {
  // Reinicia los datos previos
  incidentes.value = []
  const seriesData = []
  let sumDesviacion = 0, sumDuracion = 0, countAnomalias = 0, maxDesv = 0

  // Calcular la cantidad de días en el periodo
  const start = dayjs(desde.value)
  const end = dayjs(hasta.value)
  const numDays = end.diff(start, 'day') + 1

  // Para cada día, simulamos un valor y detectamos anomalías
  for (let i = 0; i < numDays; i++) {
    const currentDate = start.add(i, 'day')
    // Simulación de una medición (por ejemplo: valor normal alrededor de 50 ± 10)
    const baseValue = 50
    const fluct = (Math.random() * 20) - 10
    const valor = +(baseValue + fluct).toFixed(1)
    seriesData.push({ x: currentDate.valueOf(), y: valor })

    // Detectar anomalía según umbrales
    if (valor < umbralInferior.value || valor > umbralSuperior.value) {
      // Calcular la desviación porcentual con respecto al umbral pertinente
      let deviation = 0, tipo = ''
      if (valor < umbralInferior.value) {
        deviation = +(((umbralInferior.value - valor) / umbralInferior.value * 100)).toFixed(1)
        tipo = 'Baja'
      }
      else if (valor > umbralSuperior.value) {
        deviation = +(((valor - umbralSuperior.value) / umbralSuperior.value * 100)).toFixed(1)
        tipo = 'Alta'
      }
      // Simular duración del evento anómalo en minutos (1 a 60)
      const duracion = Math.floor(Math.random() * 60) + 1
      incidentes.value.push({
        fecha: currentDate.format('YYYY-MM-DD'),
        valor,
        umbral: (valor < umbralInferior.value) ? umbralInferior.value : umbralSuperior.value,
        desviacion: deviation,
        duracion,
        tipo
      })
      sumDesviacion += deviation
      sumDuracion += duracion
      countAnomalias++
      if (deviation > maxDesv) maxDesv = deviation
    }
  }

  totalAnomalias.value = countAnomalias
  if (countAnomalias > 0) {
    desviacionPromedio.value = +(sumDesviacion / countAnomalias).toFixed(1)
    duracionPromedio.value = Math.floor(sumDuracion / countAnomalias)
    maximaDesviacion.value = maxDesv
  } else {
    desviacionPromedio.value = 0
    duracionPromedio.value = 0
    maximaDesviacion.value = 0
  }

  // Formatear la serie para el gráfico de línea: cada punto incluirá un marcador rojo si es anomalía.
  chartSeries.value = [{
    name: parametro.value,
    data: seriesData.map(point => {
      const esAnomalia = point.y < umbralInferior.value || point.y > umbralSuperior.value
      return {
        x: point.x,
        y: point.y,
        marker: esAnomalia ? { fillColor: '#FF0000', size: 8 } : {}
      }
    })
  }]

  // Simular el heatmap: una serie por cada uno de hasta 7 días
  const heatmapData = []
  const daysSimulate = Math.min(numDays, 7)
  for (let d = 0; d < daysSimulate; d++) {
    const data = []
    for (let h = 0; h < 24; h++) {
      // Simula cantidad de anomalías (0 a 5) en esa hora
      data.push({ x: `${h}h`, y: Math.floor(Math.random() * 6) })
    }
    heatmapData.push({ name: `Día ${d + 1}`, data })
  }
  heatmapSeries.value = heatmapData
}

analizar()
</script>

<style scoped>
.dashboard-anomalias {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.fecha-control, .umbrales {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metrics {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.card {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
  text-align: center;
}

.card .value {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.trend-chart, .incidents-table, .heatmap-chart {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.incidents-table table {
  width: 100%;
  border-collapse: collapse;
}

.incidents-table th,
.incidents-table td {
  padding: 0.5rem;
  border: 1px solid #ccc;
  text-align: left;
}
</style>
