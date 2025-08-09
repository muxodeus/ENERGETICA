<!-- src/views/Tendencias.vue -->
<template>
  <div class="trends-dashboard">
    <!-- Header -->
    <DashboardHeader 
      title="Tendencias en Estado Estable" 
      :subtitle="`Medidor: ${meterName}`" 
    />

    <!-- Panel de Configuración -->
    <div class="config-panel">
      <div class="date-filters">
        <label>Desde:
          <input type="date" v-model="desde" />
        </label>
        <label>Hasta:
          <input type="date" v-model="hasta" />
        </label>
      </div>
      <div class="variable-and-layout">
        <button class="btn-config" @click="mostrarModal = true">
          Configurar Variables
        </button>
        <div class="layout-mode">
          <span>Modo:</span>
          <label>
            <input type="radio" value="combinado" v-model="layoutMode" /> Combinado
          </label>
          <label>
            <input type="radio" value="separado"   v-model="layoutMode" /> Separado
          </label>
        </div>
      </div>
      <div class="config-buttons">
        <button @click="filtrarDatos">Filtrar Datos</button>
        <button @click="exportarCSV">Exportar CSV</button>
        <button @click="guardarConfig">Guardar Configuración</button>
        <button @click="limpiarConfig">Limpiar Configuración</button>
      </div>
    </div>
    
    <div class="quick-range">
  <button @click="consultarRango('1h')">Última hora</button>
  <button @click="consultarRango('1d')">Último día</button>
  <button @click="consultarRango('1w')">Última semana</button>
  <button @click="consultarRango('1m')">Último mes</button>
  <button @click="consultarRango('3m')">Últimos 3 meses</button>
  <button @click="consultarRango('1y')">Último año</button>
</div>


    <!-- Vista combinada -->
    <div v-if="layoutMode==='combinado' && combinedSeries.length" class="combined-chart">
      <ApexChart 
        ref="combinedChartRef"
        type="line" 
        height="400" 
        :options="combinedOptions" 
        :series="combinedSeries" 
      />
      <div class="stats-box">
        <table>
          <thead>
            <tr>
              <th>Parámetro</th><th>Mín</th><th>P5</th><th>Avg</th><th>P95</th><th>Máx</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="serie in combinedSeries" :key="serie.name">
              <td>{{ serie.name }}</td>
              <td>{{ stats[serie.name].min }}</td>
              <td>{{ stats[serie.name].p5 }}</td>
              <td>{{ stats[serie.name].avg }}</td>
              <td>{{ stats[serie.name].p95 }}</td>
              <td>{{ stats[serie.name].max }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vista separada -->
    <div v-else-if="layoutMode==='separado' && combinedSeries.length" class="separated-charts">
      <div v-for="serie in combinedSeries" :key="serie.name" class="trend-gaussian-container">
        <div class="trend-chart">
          <h3>{{ serie.name }}</h3>
          <ApexChart
            type="line"
            height="320"
            :options="combinedOptions"
            :series="[serie]"
          />
          <div class="stats-box">
            <table>
              <thead>
                <tr>
                  <th>Parámetro</th><th>Mín</th><th>P5</th><th>Avg</th><th>P95</th><th>Máx</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ serie.name }}</td>
                  <td>{{ stats[serie.name].min }}</td>
                  <td>{{ stats[serie.name].p5 }}</td>
                  <td>{{ stats[serie.name].avg }}</td>
                  <td>{{ stats[serie.name].p95 }}</td>
                  <td>{{ stats[serie.name].max }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="statistical-chart">
          <StatisticalDistributionChart :data="serie.data" />
        </div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-else class="no-data">
      <p>No hay datos para mostrar.</p>
    </div>

<div v-if="envioOK" class="envio-exito">
  ✔️ Tendencia guardada exitosamente
</div>

<div class="fuente-datos">
  <label><input type="radio" value="realtime" v-model="fuenteDatos" /> Tiempo Real</label>
  <label><input type="radio" value="hora" v-model="fuenteDatos" /> Histórica por Hora</label>
</div>


    <!-- Modal de Variables -->
    <VariablesToggle 
      v-if="mostrarModal" 
      :visible="mostrarModal" 
      :initialSelected="selectedVariables" 
      @update:selected="onUpdateVariables" 
      @close="mostrarModal=false" 
    />

    <FooterGlobal />
  </div>
</template>

<script setup>
import { 
  ref, 
  computed, 
  watch, 
  reactive, 
  onMounted, 
  onUnmounted 
} from 'vue'
import mqtt from 'mqtt'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import DashboardHeader                 from '@/components/DashboardHeader.vue'
import ApexChart                       from 'vue3-apexcharts'
import VariablesToggle                 from '@/components/VariablesToggle.vue'
import StatisticalDistributionChart    from '@/components/StatisticalDistributionChart.vue'
import FooterGlobal                    from '@/components/FooterGlobal.vue'

// Medidor desde ruta o por defecto
const route     = useRoute()
const meterName = ref(route.params.meterName || '—')

// Fechas
const desde = ref(dayjs().format('YYYY-MM-DD'))
const hasta = ref(dayjs().format('YYYY-MM-DD'))

// Parámetros disponibles
const availableParameters = [
  { key:'voltaje_A',      name:'Voltaje A'      },
  { key:'corriente_A',    name:'Corriente A'    },
  { key:'potencia_total', name:'Potencia Total' },
  { key:'energia_total',  name:'Energía Total'  }
]

const selectedVariables = ref(availableParameters.map(p => p.key))
const layoutMode   = ref('combinado')
const mostrarModal = ref(false)
const buffer = reactive({})
availableParameters.forEach(p => { buffer[p.key] = [] })

const combinedSeries = ref([])
const combinedOptions = {
  chart: { id:'tendencias', animations:{enabled:true} },
  xaxis: { type:'datetime', title:{text:'Tiempo (minuto)'} },
  stroke:{curve:'smooth'},
  legend:{position:'top'}
}

const tableData = ref([])

function computeStats(arr) {
  if (!arr.length) return { min:0, p5:0, avg:0, p95:0, max:0 }
  const sorted = [...arr].sort((a,b) => a - b)
  const avg = arr.reduce((sum, v) => sum + v, 0) / arr.length
  const p = x => sorted[Math.floor(sorted.length * x)]
  return { min: sorted[0], p5: p(0.05), avg, p95: p(0.95), max: sorted[sorted.length - 1] }
}

const stats = computed(() => {
  const out = {}
  combinedSeries.value.forEach(serie => {
    const vals = serie.data.map(pt => pt.y)
    out[serie.name] = computeStats(vals)
  })
  return out
})

function initSeries() {
  combinedSeries.value = selectedVariables.value.map(key => {
    const { name } = availableParameters.find(p => p.key === key)
    return { name, data: [] }
  })
}
initSeries()

watch(selectedVariables, () => {
  initSeries()
  tableData.value = []
  availableParameters.forEach(p => buffer[p.key] = [])
}, { immediate: true })

let client = null
let timerId = null
const envioOK = ref(false)

onMounted(() => {
  // Intervalo de captura y promedio
  timerId = setInterval(() => {
    const ts = dayjs().startOf('minute').valueOf()
    const minute = dayjs(ts).format('HH:mm')
    const row = { timestamp: ts, minute }

    let avgVoltaje = 0, avgCorriente = 0, avgPotencia = 0, avgEnergia = 0

    combinedSeries.value.forEach(serie => {
      const key = availableParameters.find(p => p.name === serie.name).key
      const vals = buffer[key]
      const avg  = vals.length ? vals.reduce((s,v) => s+v, 0)/vals.length : 0

      if (key === 'voltaje_A')       avgVoltaje = avg
      if (key === 'corriente_A')     avgCorriente = avg
      if (key === 'potencia_total')  avgPotencia = avg
      if (key === 'energia_total')   avgEnergia = avg

      serie.data.push({ x: ts, y: +avg.toFixed(2) })
      if (serie.data.length > 60) serie.data.shift()

      row[key] = avg
      buffer[key] = []
    })

    tableData.value.unshift(row)
    if (tableData.value.length > 60) tableData.value.pop()

    if (auth.selectedMeter?.id) {
      fetch('/api/tendencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medidor_id: auth.selectedMeter.id,
          timestamp: new Date(ts).toISOString(),
          voltaje_A: +avgVoltaje.toFixed(2),
          corriente_A: +avgCorriente.toFixed(2),
          potencia_total: +avgPotencia.toFixed(2),
          energia_total: +avgEnergia.toFixed(2)
        })
      }).then(res => {
        if (!res.ok) throw new Error('Error al guardar tendencia')
        envioOK.value = true
        setTimeout(() => envioOK.value = false, 3000)
      }).catch(err => {
        console.error('[Tendencias] Falló guardado:', err)
      })
    }
  }, 60_000)

  // Fetch inicial opcional
  ;(async () => {
    await fetch('/api/tendencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
  })()
})

onUnmounted(() => {
  if (client) client.end()
  clearInterval(timerId)
})

async function cargarTendenciasPorRango({ desde, hasta }) {
  if (!auth.selectedMeter?.id) return
  const url = `/api/tendencias?medidor_id=${auth.selectedMeter.id}&desde=${desde}&hasta=${hasta}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    combinedSeries.value.forEach(s => s.data = [])
    tableData.value = []
    for (const punto of data) {
      const x = new Date(punto.timestamp).getTime()
      combinedSeries.value.forEach(serie => {
        const key = availableParameters.find(p => p.name === serie.name).key
        serie.data.push({ x, y: punto[key] ?? null })
      })
      tableData.value.push({
        timestamp: x,
        minute: dayjs(x).format('HH:mm'),
        voltaje_A: punto.voltaje_A,
        corriente_A: punto.corriente_A,
        potencia_total: punto.potencia_total,
        energia_total: punto.energia_total
      })
    }
  } catch (err) {
    console.error('❌ Error cargando tendencias:', err)
  }
}

function filtrarDatos() {
  const d1 = dayjs(desde.value).startOf('day').toISOString()
  const d2 = dayjs(hasta.value).endOf('day').toISOString()
  if (fuenteDatos.value === 'hora') {
    cargarHistoricoHora({ desde: d1, hasta: d2 })
  } else {
    cargarTendenciasPorMinuto({ desde: d1, hasta: d2 })
  }
}

async function cargarHistoricoHora({ desde, hasta }) {
  if (!auth.selectedMeter?.id) return
  const res = await fetch(`/api/tendencias/hora?medidor_id=${auth.selectedMeter.id}&desde=${desde}&hasta=${hasta}`)
  const data = await res.json()
  combinedSeries.value.forEach(s => s.data = [])
  tableData.value = []
  data.forEach(punto => {
    const x = new Date(punto.timestamp).getTime()
    combinedSeries.value.forEach(serie => {
      const key = availableParameters.find(p => p.name === serie.name)?.key
      serie.data.push({ x, y: punto[key] ?? null })
    })
    tableData.value.push({
      timestamp: x,
      minute: dayjs(x).format('YYYY-MM-DD HH:mm'),
      voltaje_A: punto.voltaje_A,
      corriente_A: punto.corriente_A,
      potencia_total: punto.potencia_total,
      energia_total: punto.energia_total
    })
  })
}

function consultarRango(periodo) {
  const ahora = dayjs()
  const mapa = {
    '1h': ahora.subtract(1, 'hour'),
    '1d': ahora.subtract(1, 'day'),
    '1w': ahora.subtract(1, 'week'),
    '1m': ahora.subtract(1, 'month'),
    '3m': ahora.subtract(3, 'month'),
    '1y': ahora.subtract(1, 'year')
  }
  const d1 = mapa[periodo].toISOString()
  const d2 = ahora.toISOString()
  cargarTendenciasPorRango({ desde: d1, hasta: d2 })
}

const fuenteDatos = ref('realtime')  // o 'hora'
</script>


<style scoped>
.trends-dashboard { padding:1.5rem; }
.config-panel { display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; }
.date-filters label { margin-right:1rem; }
.variable-and-layout { display:flex; gap:1rem; align-items:center; }
.layout-mode span { margin-right:.5rem; }
.config-buttons button { margin-right:.5rem; }
.combined-chart, .separated-charts { margin-top:1.5rem; }
.stats-box { margin-top:1rem; }
.stats-box table { width:100%; border-collapse:collapse; }
.stats-box th, .stats-box td { border:1px solid #ddd; padding:.5rem; text-align:center; }
.no-data { text-align:center; color:#666; margin-top:2rem; }
.envio-exito {
  margin-top: 0.5rem;
  color: #2e7d32;
  font-weight: bold;
}
.quick-range {
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.quick-range button {
  background: #f1f1f1;
  border: 1px solid #ccc;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.fuente-datos {
  margin-bottom: 1rem;
  display: flex;
  gap: 1.5rem;
  font-weight: bold;
}


</style>
