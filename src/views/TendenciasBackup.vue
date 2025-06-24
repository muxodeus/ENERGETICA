<!-- src/views/Tendencias.vue -->
<template>
  <div class="tendencias-estables-dashboard">
    <!-- Encabezado global reutilizable -->
    <DashboardHeader 
      title="Tendencias en Estado Estable"
      subtitle="Desglose por sectores y horarios clave" 
    />
    
    <div class="tendencias-dashboard">
      <!-- Encabezado interno similar al de ConsumoEnergetica.vue, sin fondo blanco -->
      <header class="barra-superior">
        <h2>Tendencias históricas</h2>
        <div class="filtros">
          <Picklist
            v-model="variable"
            label="Variable"
            :options="[
              { value: 'energia', label: 'Energía activa (kWh)' },
              { value: 'potencia', label: 'Potencia (kW)' }
            ]"
          />
          <Picklist
            v-model="dispositivo"
            label="Dispositivo"
            :options="[
              { value: 'todos', label: 'Todos' },
              { value: 'medidor1', label: 'Medidor 1' },
              { value: 'medidor2', label: 'Medidor 2' }
            ]"
          />
          <div class="fechas">
            <label>Desde:</label>
            <input type="date" v-model="desde" />
            <label>Hasta:</label>
            <input type="date" v-model="hasta" />
          </div>
          <button @click="filtrar">Filtrar</button>
        </div>
      </header>

      <section class="selector-intervalo">
        <button @click="setInterval(7)">Últimos 7 días</button>
        <button @click="setInterval(15)">Últimos 15 días</button>
        <button @click="setInterval(30)">Últimos 30 días</button>
      </section>

      <section class="grafico-linea">
        <h3>Comportamiento por fecha</h3>
        <ApexChart
          type="line"
          height="320"
          :options="lineOptions"
          :series="lineSeries"
        />
      </section>

      <section class="grafico-heatmap">
        <h3>Mapa de consumo horario</h3>
        <ApexChart
          type="heatmap"
          height="320"
          :options="heatmapOptions"
          :series="heatmapSeries"
        />
      </section>
    </div>

    <!-- Componente Footer Global -->
    <FooterGlobal />
  </div>
</template>

<script setup>
import Picklist from '../components/Picklist.vue'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import ApexChart from 'vue3-apexcharts'
import DashboardHeader from '@/components/DashboardHeader.vue'
import FooterGlobal from '@/components/FooterGlobal.vue'

// Variables de filtro
const variable = ref('energia')
const dispositivo = ref('todos')
const desde = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))

// Configuración del gráfico de línea
const lineSeries = ref([
  { name: 'Actual', type: 'line', data: [] },
  { name: 'Histórico Promedio', type: 'area', data: [] }
])
const lineOptions = ref({
  chart: {
    id: 'tendencias-linea',
    toolbar: { tools: { zoom: true, reset: true, pan: true } },
    zoom: { enabled: true, type: 'x' }
  },
  colors: ['#007bff', '#b0c4de'],
  stroke: { curve: 'smooth' },
  xaxis: { type: 'datetime' },
  fill: {
    type: 'area',
    gradient: { opacityFrom: 0.2, opacityTo: 0 }
  },
  tooltip: { x: { format: 'yyyy-MM-dd' } }
})

// Configuración del gráfico de heatmap
const heatmapSeries = ref([])
const heatmapOptions = ref({
  chart: { id: 'tendencias-heatmap' },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'category',
    categories: Array.from({ length: 24 }, (_, i) =>
      i.toString().padStart(2, '0') + 'h'
    )
  },
  colors: ['#e0f3f8', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'],
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      radius: 4,
      useFillColorAsStroke: false
    }
  }
})

// Función para generar series de línea (simulación)
function generarSeriesLine() {
  const inicio = dayjs(desde.value)
  const dias = dayjs(hasta.value).diff(inicio, 'day') + 1
  const actual = []
  const historico = []
  for (let i = 0; i < dias; i++) {
    const fecha = inicio.add(i, 'day').valueOf()
    actual.push({ x: fecha, y: +(Math.random() * 30 + 20).toFixed(2) })
    historico.push({ x: fecha, y: +(Math.random() * 10 + 25).toFixed(2) })
  }
  lineSeries.value[0].data = actual
  lineSeries.value[1].data = historico
}

// Función para generar datos del heatmap (simulación para 7 días)
function generarHeatmap() {
  const series = []
  for (let d = 1; d <= 7; d++) {
    const dia = `Día ${d}`
    const data = []
    for (let h = 0; h < 24; h++) {
      data.push({
        x: h.toString().padStart(2, '0') + 'h',
        y: +(Math.random() * 8 + 2).toFixed(1)
      })
    }
    series.push({ name: dia, data })
  }
  heatmapSeries.value = series
}

// Función de filtrado: genera datos para los gráficos
function filtrar() {
  generarSeriesLine()
  generarHeatmap()
}

// Función para ajustar intervalo de fechas y reenviar filtro
function setInterval(dias) {
  desde.value = dayjs().subtract(dias, 'day').format('YYYY-MM-DD')
  hasta.value = dayjs().format('YYYY-MM-DD')
  filtrar()
}

onMounted(() => {
  filtrar()
})
</script>

<style scoped>
.tendencias-estables-dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fc;
  box-sizing: border-box;
  padding-bottom: 3rem; /* Espacio para el FooterGlobal */
}

.tendencias-dashboard {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Actualización del estilo del header para que sea idéntico a ConsumoEnergetico.vue */
.barra-superior {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: transparent; /* Sin fondo blanco */
  border: none;
  box-shadow: none;
}
.barra-superior h2 {
  font-size: 2rem;
  margin: 0;
  text-align: center;
}

/* Estilos para los filtros en una sola línea horizontal */
.filtros {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.fechas {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
.fechas label {
  margin-right: 0.25rem;
}

/* Selector de intervalo sin cambios */
.selector-intervalo {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
    align-items: center;
  justify-content: center;
}
.selector-intervalo button {
  background: #e0e4ef;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.selector-intervalo button:hover {
  background-color: #cfd4e2;
}

/* Secciones de gráficos */
.grafico-linea,
.grafico-heatmap {
  background: transparent;
  border: none;
  padding: 0;
}
</style>
