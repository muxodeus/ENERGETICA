<template>
  <div class="dashboard-factor-carga">
    <header class="header">
      <h2>Dashboard de Factor de Carga</h2>
      <div class="controls">
        <label>Desde:</label>
        <input type="date" v-model="desde" />
        <label>Hasta:</label>
        <input type="date" v-model="hasta" />
        <button @click="analizar">Analizar</button>
      </div>
    </header>
    
    <section class="trend-chart">
      <h3>Tendencia del Factor de Carga</h3>
      <ApexChart type="line" height="300" :options="chartOptions" :series="chartSeries" />
    </section>
    
    <section class="metrics-table">
      <h3>Métricas del Periodo</h3>
      <table>
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total de Energía Consumida</td>
            <td>{{ totalEnergy }} kWh</td>
          </tr>
          <tr>
            <td>Demanda Máxima</td>
            <td>{{ maxDemand }} kW</td>
          </tr>
          <tr>
            <td>Demanda Promedio</td>
            <td>{{ averageDemand }} kW</td>
          </tr>
          <tr>
            <td>Factor de Carga</td>
            <td class="factor-carga">{{ loadFactor }}%</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import dayjs from 'dayjs'
// Asegúrate de tener instalado ApexCharts y de que el componente ApexChart esté registrado globalmente o importado.
  
const desde = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))

// Métricas a mostrar
const totalEnergy = ref(0)
const maxDemand = ref(0)
const averageDemand = ref(0)
const loadFactor = ref(0) // expresado en porcentaje

// Datos para la tendencia: utilizamos un gráfico de línea  
const chartSeries = ref([])
const chartOptions = ref({
  chart: { id: 'trend-factor-carga' },
  xaxis: { 
    type: 'datetime',
    labels: { datetimeUTC: false }
  },
  yaxis: {
    title: { text: 'Factor de Carga (%)' },
    min: 0,
    max: 100
  },
  title: { text: 'Tendencia del Factor de Carga' }
})

function analizar() {
  // Convertimos las fechas y calculamos el número de días en el periodo.
  const start = dayjs(desde.value)
  const end = dayjs(hasta.value)
  const numDays = end.diff(start, 'day') + 1
  
  // Simulación de métricas:
  // - Total de energía consumida entre 500 y 1500 kWh.
  totalEnergy.value = +(Math.random() * (1500 - 500) + 500).toFixed(1)
  
  // - Demanda máxima entre 20 y 50 kW.
  maxDemand.value = +(Math.random() * (50 - 20) + 20).toFixed(1)
  
  // - Demanda promedio entre 10 y 25 kW.
  averageDemand.value = +(Math.random() * (25 - 10) + 10).toFixed(1)
  
  // Definición del factor de carga: (demanda promedio / demanda máxima) * 100
  loadFactor.value = +((averageDemand.value / maxDemand.value) * 100).toFixed(0)
  
  // Simular una tendencia diaria del factor de carga: cada día un valor entre 50% y 100%.
  const seriesData = []
  for (let i = 0; i < numDays; i++) {
    const currentDate = start.add(i, 'day')
    const fcDaily = +(Math.random() * (100 - 50) + 50).toFixed(0)
    seriesData.push({ x: currentDate.valueOf(), y: fcDaily })
  }
  
  chartSeries.value = [{
    name: 'Factor de Carga',
    data: seriesData
  }]
}

analizar()
</script>

<style scoped>
.dashboard-factor-carga {
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

.trend-chart {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.metrics-table {
  background: #fff;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.metrics-table table {
  width: 100%;
  border-collapse: collapse;
}

.metrics-table th,
.metrics-table td {
  padding: 0.5rem;
  border: 1px solid #ccc;
  text-align: left;
}

.factor-carga {
  color: green;
  font-weight: bold;
  font-size: 1.8rem;
}
</style>
